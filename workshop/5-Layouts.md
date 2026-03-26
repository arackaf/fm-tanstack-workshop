# Layouts

## Objectives

- Create a layout
- Load data in it (yes you can do that)
- Revalidate our layout

## Layouts are not special

```ts
// admin/route.tsx
export const Route = createFileRoute("/app/admin")({
  component: RouteComponent,
});
```

This is a layout, but it looks just like any other, "normal" route, because it is.

It takes the same loader argument, if you want. Data fetched in a layout are merged, and available (and statically typed!) in any pages underneath the layout.

This pairs well with the invalidation we just saw. If some (shared) pieces of data can be moved to a load, the pages underneath can be invalidated without needing to reload the data loaded in the layouts.
