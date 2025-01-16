import { InitialWalletPage } from "@/pages/InitialWalletPage";
import { createFileRoute, redirect } from "@tanstack/react-router";

const API_URL = import.meta.env.VITE_API_URL;

export const Route = createFileRoute("/_authenticated/onboard/wallet-key")({
  beforeLoad: async ({ context }) => {
    const isOnboardedCall = await fetch(
      `${API_URL}/auth/profile/has-onboarded`,
      {
        headers: {
          Authorization: `Bearer ${context.auth.accessToken}`,
        },
      }
    );

    if (!isOnboardedCall.ok) {
      console.error("Failed to check if user has onboarded");
      throw redirect({
        to: "/callback/userError",
      });
    }

    const isOnboarded: { hasOnboarded: boolean } = await isOnboardedCall.json();

    if (isOnboarded.hasOnboarded) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: InitialWalletPage,
});
