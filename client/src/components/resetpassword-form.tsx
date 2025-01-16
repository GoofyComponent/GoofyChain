import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "@tanstack/react-router";
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
import HyperText from "./ui/hyper-text";

import logo from "@/assets/img/logo.png";

const API_URL = import.meta.env.VITE_API_URL;
const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, ""),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      form.setError("password", {
        type: "server",
        message: "Invalid or missing token",
      });
      return;
    }

    const resetPasswordApi = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({
        token,
        password: values.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!resetPasswordApi.ok) {
      const error = await resetPasswordApi.json();
      if (!Array.isArray(error.message)) {
        error.message = [error.message];
      }

      for (const message of error.message) {
        const triggers = ["password", "confirmPassword"];

        for (const trigger of triggers) {
          if (message.includes(trigger)) {
            form.setError(trigger as keyof typeof values, {
              type: "server",
              message: message,
            });
          }
        }
      }
    } else {
      const response = await resetPasswordApi.json();

      const user = response.user;
      const jwt = response.accessToken;

      await login(user, jwt);
      return navigate({
        to: "/login",
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
              <HyperText
                className="text-5xl font-bold select-none"
                animateOnHover={false}
              >
                GoofyChain
              </HyperText>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-center text-sm">
                Enter your new password to reset your password
              </p>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New password"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                        required
                      />
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
                  "Reset password"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
