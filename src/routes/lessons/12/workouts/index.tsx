import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import {
  createMiddleware,
  createServerFn,
  useServerFn,
} from "@tanstack/react-start";

export const Route = createFileRoute("/lessons/12/workouts/")({
  component: RouteComponent,
});

const __prelim_middleware1 = createMiddleware({ type: "function" })
  .inputValidator((input: { middlewareArg: string }) => input)
  .client(async ({ data, next }) => {
    const { middlewareArg } = data;

    console.log("In middleware on Client, before", middlewareArg);

    return next({
      sendContext: {
        sendContextSetInClient: "x",
      },
      context: {
        contextSetInClient: "y",
      },
    });
  })
  .server(async ({ next, data, context }) => {
    const { middlewareArg } = data;
    const { sendContextSetInClient } = context;

    console.log("In middleware on Server, before", {
      middlewareArg,
      sendContextSetInClient,
    });

    const result = await next({
      context: {
        contextSetInServerInMiddleware: "aaaa",
      },
      sendContext: {
        valueSentFromServerToClient: "Yoooooo",
      },
    });

    console.log("In middleware on Server, after", middlewareArg);

    return result;
  });

const middleware1 = createMiddleware({ type: "function" })
  .middleware([__prelim_middleware1])
  .client(async ({ next }) => {
    const result = await next();

    const xxx = result.context.valueSentFromServerToClient;
    console.log("Here's the vlaue the right way", xxx);

    return result;
  });

const serverFn = createServerFn({ method: "GET" })
  .inputValidator((input: { functionArg: string }) => input)
  .middleware([middleware1])
  .handler(async ({ data, context }) => {
    context.contextSetInServerInMiddleware;
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(
      "\n",
      "==============================================\n",
      "I'm in a server function!!!\n",
      `Server Function Arg: ${data.functionArg}\n`,
      "==============================================\n",
      "\n",
    );
    return {
      message: "Hello, world!",
    };
  });

function RouteComponent() {
  const call = useServerFn(serverFn);

  return (
    <div className="flex flex-col gap-4">
      <span>Click this button!</span>
      <Button
        onClick={() =>
          call({
            data: {
              middlewareArg: "Middleware Arg",
              functionArg: "Function Arg",
            },
          })
        }
        variant="secondary"
      >
        Click me
      </Button>
    </div>
  );
}
