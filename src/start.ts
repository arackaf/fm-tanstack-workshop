import { createStart, createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

const globalFnMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    return next();
  },
);

const globalRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    return next();
  },
);

export const startInstance = createStart(() => {
  return {
    functionMiddleware: [globalFnMiddleware],
    requestMiddleware: [globalRequestMiddleware],
  };
});
