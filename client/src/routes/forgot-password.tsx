import ForgotPasswordPage from "@/pages/ForgotPassword";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/forgot-password-confirmation",
      });
    }
  },
  component: ForgotPasswordPage,
});
