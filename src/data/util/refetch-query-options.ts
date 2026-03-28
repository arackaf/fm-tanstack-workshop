import { type RequiredFetcher } from "@tanstack/react-start";
import { queryOptions, type QueryKey } from "@tanstack/react-query";
import { getServerFunctionKey } from "@/middleware/refetch-lookup";

export type AnyServerFn = RequiredFetcher<any, any, any>;
export type RefetchPayload = {
  key: any;
  fnKey: string;
  arg: any;
};

export function refetchedQueryOptions<T extends AnyServerFn>(
  queryKey: QueryKey,
  serverFn: T,
  arg: Parameters<T>[0]["data"],
) {
  const queryKeyToUse = [...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  const serverFnKey = getServerFunctionKey(serverFn);
  if (!serverFnKey) {
    throw new Error(`Server function key '${serverFnKey}' has not been added`);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async (): Promise<Awaited<ReturnType<T>>> => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        fnKey: serverFnKey,
        arg,
      },
    },
  });
}
