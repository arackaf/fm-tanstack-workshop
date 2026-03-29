import { createStart, createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

const globalFnMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    setResponseHeader("x-rackis-fn", "yoooooooo");
    return next({
      context: {
        globalFnValue: "456",
      },
    });
  },
);

const globalRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    setResponseHeader("x-rackis-req", "heyoooooooooo");

    return next({
      context: {
        globalReqValue: "123",
      },
    });
  },
);

export const startInstance = createStart(() => {
  return {
    functionMiddleware: [globalFnMiddleware],
    requestMiddleware: [globalRequestMiddleware],
  };
});
