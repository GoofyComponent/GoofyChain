import ForgotPasswordConfirmationPage from "@/pages/ForgotPasswordConfirmation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password-confirmation")({
  component: ForgotPasswordConfirmationPage,
});
