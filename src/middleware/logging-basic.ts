import {
  addNetworkTimingLog,
  setNetworkTimingLogClientEnd,
} from "@/server-functions/network-timing-logs";
import { createMiddleware } from "@tanstack/react-start";

export const basicLoggingMiddleware = createMiddleware({ type: "function" })
  .inputValidator((input: { operation: string }) => input)
  .client(async ({ next }) => {
    const clientStartTime = new Date();

    const result = await next({
      sendContext: {
        clientStart: clientStartTime,
      },
    });

    // @ts-expect-error
    const traceId = result.context.traceId;

    const clientEndTime = new Date();
    setNetworkTimingLogClientEnd({
      data: {
        traceId,
        clientEnd: clientEndTime,
      },
    });

    return result;
  })
  .server(async ({ next, context, data }) => {
    const { clientStart } = context;
    const traceId = crypto.randomUUID();

    const serverStart = new Date();

    const result = await next({
      sendContext: {
        traceId,
      },
    });

    const serverEnd = new Date();

    await addNetworkTimingLog({
      data: {
        operation: data.operation,
        traceId,
        clientStart,
        serverStart,
        serverEnd,
      },
    });

    return result;
  });
