import { GalleryVerticalEnd, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import useAuth from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import clsx from "clsx";

const API_URL = import.meta.env.VITE_API_URL;
const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const registerApi = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!registerApi.ok) {
      const error = await registerApi.json();
      if (!Array.isArray(error.message)) {
        error.message = [error.message];
      }

      for (const message of error.message) {
        const triggers = ["email", "password", "firstName", "lastName"];

        for (const trigger of triggers) {
          if (message.includes(trigger)) {
            console.log("Setting error for:", trigger);
            form.setError(trigger as keyof typeof values, {
              type: "server",
              message: message,
            });
          }
        }
      }
    } else {
      const response = await registerApi.json();

      const user = response.user;
      const jwt = response.accessToken;

      await login(user, jwt);
      return navigate({
        to: "/dashboard",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">GoofyChain</span>
              </a>
              <h1 className="text-xl font-bold">
                Welcome <span className="italic">BACK</span> to Acme Inc.
              </h1>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={clsx("w-full", {
                  "animate-spin": form.formState.isSubmitting,
                })}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <LoaderCircle /> : "Login"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
