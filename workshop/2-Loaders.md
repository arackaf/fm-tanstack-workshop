## Objectives

- Look at our first loader

## Loaders

Loaders load the data for your given page (or layout)

Just add a loader to your route config

```ts
  loader: async () => {
    // load your data ...

    return {
      // ...
    };
  },
```

- Add a `loader` async method in your route config
- Request your data (we'll see how to do that soon) in the loader, and return it.
  - Access that data with the Route.useLoaderData() hook
  - Or the `useLoaderData` hook, with the route passed in via `{ from }`

## Loaders are isomorphic!!!!

This is important.

Anyone remember what that means?
