import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password/$token")({
  component: ResetPasswordPage,
});
