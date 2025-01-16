import { SettingsPage } from "@/pages/SettingsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});
