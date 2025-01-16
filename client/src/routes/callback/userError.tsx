import useAuth from "@/hooks/useAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/callback/userError")({
  component: RouteComponent,
});

function RouteComponent() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();

    setTimeout(() => {
      navigate({
        to: "/login",
      });
    }, 1000);
  }, [logout, navigate]);

  return (
    <div className="flex w-full h-full">
      <LoaderCircle size={64} className="animate-spin m-auto" />
    </div>
  );
}
