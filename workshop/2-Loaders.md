# Routing Basics

Docs: [https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes](https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes)

## Objectives

- Look at our first loader

## Loaders

Loaders load the data for your given page (or layout)

==========================
Loaders are isomorphic!!!!
==========================

- Add a `loader` async method in your route config
- Request your data (we'll see how to do that soon) in the loader, and return it.
  - Access that data with the Route.useLoaderData() hook
  - Or the `useLoaderData` hook, with the route passed in via `{ from }`
