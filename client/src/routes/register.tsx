import SignupPage from "@/pages/Signuppage";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: SignupPage,
});
