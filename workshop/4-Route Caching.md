# Route Caching

## Objectives

- Cache route pages
- Observe stale content with background refreshing
- Mutate data and revalidate routes

## Caching pages

The options object we pass to `createFileRoute("/path")` takes _a lot_ of options. Some of them relate to caching, which is what we'll look at here

- staleTime
  - Controls when TanStack will background re-fetch a route page
  - Stale content will show while that happens
- gcTime
  - Controls how long TanStack will keep a page in cache at all
  - When this time hits, TanStack may completely eject your cached page, and therefore show nothing (or a pending component) while the content loads
  - This value is _not_ guaranteed to be honred. This value _allows_ TanStack to eject a page, but does not guarantee it will be ejected.
  - For stronger caching guarantees, stay tuned for react-query

```js
{
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 10,
}
```

With this configuration, the page will background refetch after 5 seconds, and may be completely ejected from cache after 10 seconds

## Revalidation

When you mutate some data and want to force a reload, you can call `router.invalidate`, which will reload active routes, and force all inactive routes to be invalidated, and re-fetched the next time they're browsed to.

To be more fine-grained, you can pass a filter into `router.invalidate`

`router.invalidate` leads to a stale while invalidate mechanism, where the old route content is rendered, while a background re-fetch is done.

To purge old routes completely, and force a true refetch, use `router.clearCache`
