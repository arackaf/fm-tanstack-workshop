import type { RequiredFetcher } from "@tanstack/react-start";

type AnyServerFn = RequiredFetcher<any, any, any>;

const serverFnLookup: Map<string, AnyServerFn> = new Map();
const serverFnKeyLookup: Map<AnyServerFn, string> = new Map();

export const addServerFunction = (name: string, serverFn: AnyServerFn) => {
  serverFnLookup.set(name, serverFn);
  serverFnKeyLookup.set(serverFn, name);
};

export const getServerFunction = (name: string): AnyServerFn | undefined => {
  return serverFnLookup.get(name);
};

export const getServerFunctionKey = (
  serverFn: AnyServerFn,
): string | undefined => {
  return serverFnKeyLookup.get(serverFn);
};
