import LoginPage from "@/pages/Loginpage";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: LoginPage,
});
