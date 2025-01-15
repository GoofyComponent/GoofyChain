import { DashboardLayout } from "@/pages/DashboardLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});
