import useAuth from "@/hooks/useAuth";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/callback/userError")({
  component: RouteComponent,
});

function RouteComponent() {
  const { logout } = useAuth();
  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    logout();

    setTimeout(() => {
      router.invalidate();
      navigate({
        to: "/login",
      });
    }, 1000);
  }, [logout, navigate, router]);

  return (
    <div className="flex w-full h-full">
      <LoaderCircle size={64} className="animate-spin m-auto" />
    </div>
  );
}
