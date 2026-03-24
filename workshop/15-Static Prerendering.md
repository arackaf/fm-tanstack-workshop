## Static Pre-rendering

So you want to static pre-generate your app.

Two things to know:

1. Pre-rendering routes

```ts
export default defineConfig({
  plugins: [
    tanstackStart({
      prerender: {
        // Enable prerendering
        enabled: true,
      },
    }),
  ],
});
```

See the docs for full options

https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering

2. Static server function calls

It's a middleware you can install, and use

https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions

Let's see a demo!

https://github.com/arackaf/tanstack-blog-blog-post
