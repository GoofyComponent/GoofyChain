import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Link, useNavigate } from "@tanstack/react-router";
import useAuth from "@/hooks/useAuth";
import clsx from "clsx";
import HyperText from "./ui/hyper-text";

import logo from "@/assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL;
const formSchema = z
  .object({
    email: z.string().email(),
    lastName: z.string().min(2),
    firstName: z.string().min(2),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    passwordConfirm: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["passwordConfirm"],
      });

      return false;
    }

    return true;
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const registerApi = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        lastName: values.lastName,
        firstName: values.firstName,
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
            form.setError(trigger as keyof typeof values, {
              type: "server",
              message: message,
            });
          }
        }
      }
      return;
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
              <Link
                to="/"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md">
                  <img src={logo} className="h-10 select-none" />
                </div>
                <span className="sr-only">GoofyChain</span>
              </Link>
              <h1 className="text-xl font-bold">Welcome to</h1>
              <HyperText
                className="text-5xl font-bold select-none"
                animateOnHover={false}
              >
                GoofyChain
              </HyperText>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Sign in
                </Link>
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
                name="firstName"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} required />
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
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex justify-center items-center">
                    <LoaderCircle className="animate-spin" />
                  </div>
                ) : (
                  "Sign up"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking "Register", you agree to our Terms of Service and Privacy
        Policy.
      </div>
    </div>
  );
}
