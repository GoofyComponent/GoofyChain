import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/callback/userError" });
  }, [navigate]);

  return null;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: async ({ context, location }) => {
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

    if (!isOnboarded.hasOnboarded) {
      throw redirect({
        to: "/onboard/wallet-key",
      });
    } else {
      if (
        location.pathname === "/dashboard" ||
        location.pathname === "/dashboard/"
      ) {
        throw redirect({
          to: "/dashboard/summary",
        });
      }
    }
  },
  component: Outlet,
  pendingComponent: () => {
    return (
      <div className="w-full h-full flex justify-center align-center">
        <LoaderCircle className="animate-spin m-auto" size={64} />
      </div>
    );
  },
  errorComponent: ErrorPage,
});
