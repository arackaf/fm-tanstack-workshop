import type { RefetchPayload } from "@/data/util/refetch-query-options";
import { hashKey } from "@tanstack/react-query";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { createMiddleware, getRouterInstance } from "@tanstack/react-start";
import { getServerFunction } from "./refetch-lookup";

type RefetchMiddlewareConfig = {
  refetch: QueryKey[];
};

type RevalidationPayload = {
  refetch: RefetchPayload[];
};

const prelimRefetchMiddleware = createMiddleware({ type: "function" })
  .inputValidator((config?: RefetchMiddlewareConfig) => config)
  .client(async ({ next, data }) => {
    const { refetch = [] } = data ?? {};

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;
    const cache = queryClient.getQueryCache();

    const revalidate: RevalidationPayload = {
      refetch: [],
    };

    const allQueriesFound = refetch.flatMap(key =>
      cache.findAll({ queryKey: key, exact: false, type: "active" }),
    );

    allQueriesFound.forEach(entry => {
      const revalidatePayload: RefetchPayload =
        (entry?.meta?.__revalidate as RefetchPayload) ?? null;

      if (revalidatePayload) {
        revalidate.refetch.push({
          key: entry.queryKey,
          fnKey: revalidatePayload.fnKey,
          arg: revalidatePayload.arg,
        });
      }
    });

    return await next({
      sendContext: {
        revalidate,
      },
    });
  })
  .server(async ({ next, context }) => {
    const result = await next({
      sendContext: {
        payloads: [] as any[],
      },
    });

    const allPayloads = context.revalidate.refetch.map(refetchPayload => {
      const serverFn = getServerFunction(refetchPayload.fnKey);
      return serverFn
        ? {
            key: refetchPayload.key,
            result: serverFn({ data: refetchPayload.arg }),
          }
        : null;
    });

    for (const refetchPayload of allPayloads) {
      if (refetchPayload) {
        result.sendContext.payloads.push({
          key: refetchPayload.key,
          result: await refetchPayload.result,
        });
      }
    }

    return result;
  });

export const refetchMiddleware = createMiddleware({ type: "function" })
  .middleware([prelimRefetchMiddleware])
  .client(async ({ data, next }) => {
    const result = await next();

    const router = await getRouterInstance();
    const queryClient: QueryClient = router.options.context.queryClient;
    const allRefetchedKeys: Set<string> = new Set();

    for (const entry of result.context?.payloads ?? []) {
      allRefetchedKeys.add(hashKey(entry.key));
      queryClient.setQueryData(entry.key, entry.result, {
        updatedAt: Date.now(),
      });
    }

    data?.refetch.forEach(key => {
      const allQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: key, exact: false });

      allQueries.forEach(packet => {
        if (!allRefetchedKeys.has(hashKey(packet.queryKey))) {
          queryClient.invalidateQueries({
            queryKey: packet.queryKey,
            exact: true,
          });
        }
      });
    });

    return result;
  });
