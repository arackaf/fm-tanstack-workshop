# Course Introduction

Hi, I'm Adam, and welcome to my TanStack Start Workshop!

The repo for this course is the top pin at [https://github.com/arackaf/fm-tanstack-workshop](https://github.com/arackaf/fm-tanstack-workshop)

## Course requirements

- None (maybe)

By default this project will run against an in-memory Postgres database. On startup the database schema, and some initial data will be inserted for you, before the application starts.

Just clone the repo, `npm i`, and `npm run dev`

This means every time you stop, and restart the dev server, any data you've added or changed will be reverted.

If you'd prefer to have a persistent database, that's set up here as well, you just need to have Docker running on your machine.

Running the project with a persistent database:

- clone the repo
- npm i
- Start Docker Desktop
- Run `npm run pg`
- Open a NEW terminal and run `npm run dev`
- Browse to localhost:3000

## What is TanStack Start ... and Router

TanStack Router - [docs](https://tanstack.com/router/latest/docs/overview)
TanStack Start - [docs](https://tanstack.com/start/latest)

Router is an incredibly flexible, strongly typed JavaScript framework. Router will give you a JavaScript-driven single page application (SPA).

Start takes Router, and adds server support.

### Server support

- Server side rendering (SSR)
- Server Functions (and middleware)
- API endpoints

Even if you don't care about SSR, you'll probably need somewhere to run server-side code, and Start provides that.

If you truly don't care about SSR, and you truly just want a 100% client-driven SPA that soley calls backend services you have elsewhere, ok just use Router; hosting the resulting application will be as simple as throwing the build artifacts onto a CDN.

### Why SSR

With a normal SPA, the browser renders an empty application shell, likely with a loading spinner. That means, when the server responds to the url the user put into their browser, they see this

<img alt="SPA Flow" src="./img/1_img1.png" width="500" />

What happens then?

<img alt="Loading Spinner" src="./img/1_img2.png" width="500" />

What if, instead of rendering an empty application shell, we rendered ... the actual page?

<img alt="SSR Flow" src="./img/1_img3.png" width="500" />

Which looks like this

<img alt="User SSR" src="./img/1_img4.png" width="500" />

SSR (with a framework like React) is usually (for reasons we won't get into) tricky to get right. But TanStack Start handles this for you.
