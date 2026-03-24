# Routing Basics

Docs: [https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes](https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes)

## Objectives

- Create a route
- Create a route with a path param (ie /blog/posts/:slug)
- Look at our first loader

TanStack supports directory routes, or flat routes. We'll be using directory routes, here, but they're functionally equivalent; it's just a matter of taste. Directory routes are cleaner and clearer in my opinion, and most importantly will be simpler to demo in this workshop.

## Flat (file) routes

The [docs](https://tanstack.com/router/latest/docs/routing/file-based-routing#flat-routes) are here but we won't cover this in class.

The tl;dr is that, instead of (with directories)

app/workouts/edit/$id.tsx

You do

app.workouts.edit.$id.tsx

I much prefer directory organization for files, but either are fine, and you can even mix and match!

## Directory routing

Just put them under the right folder, and name accordingly.

// For the /workouts route
routes/workouts/index.tsx

// For the /workouts/6
routes/workouts/$id.tsx

## Route structure

- Use $xyz for path params
- Use route.tsx for a layout
- Escape route names with `[]`
  - So [route].tsx if you literally want a /route route

## This list is incomplete, paltry, even

Check the docs, there's a TON of advanced use cases. Splat routes, pathless layouts, etc. We won't pour over every cool routing trick TanStack Route is capable of, so check the docs!

Docs are here: https://tanstack.com/router/latest/docs/routing/file-based-routing

I wrote a three-part blog post on Router - part 1 covers many more routing intricacies:
https://frontendmasters.com/blog/introducing-tanstack-router/
