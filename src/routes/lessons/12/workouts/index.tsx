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

const serverFn = createServerFn({ method: "GET" })
  .inputValidator((input: { functionArg: string }) => input)
  .handler(async ({}) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(
      "\n",
      "==============================================\n",
      "I'm in a server function!!!\n",
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
