import { PreferedCurrencyPage } from "@/pages/PreferedCurrencyPage";
import { createFileRoute, redirect } from "@tanstack/react-router";

const API_URL = import.meta.env.VITE_API_URL;

export const Route = createFileRoute("/_authenticated/onboard/currency")({
  beforeLoad: async ({ context, location }) => {
    const isOnboardedCall = await fetch(
      `${API_URL}/auth/profile/has-onboarded`,
      {
        headers: {
          Authorization: `Bearer ${context.auth.accessToken}`,
        },
      }
    );

    const isOnboarded: { hasOnboarded: boolean } = await isOnboardedCall.json();

    if (isOnboarded.hasOnboarded) {
      throw redirect({
        to: "/dashboard",
      });
    }

    if (!location.state?.onboardings?.walletKey) {
      throw redirect({
        to: "/onboard/wallet-key",
      });
    }
  },
  component: PreferedCurrencyPage,
});
