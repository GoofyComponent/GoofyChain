import { Outlet, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { Helmet } from "react-helmet";

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>GoofyChain - Dashboard</title>
        <meta
          name="description"
          content="Your dashboard to view transactions and Ethereum prices."
        />
        <meta
          name="keywords"
          content="GoofyChain, Ethereum, Transactions, Prices"
        />
        <link rel="icon" type="image/svg+xml" href="/logo.png" />
      </Helmet>
      <AppSidebar
        user={user}
        logout={async () => {
          await logout();
          navigate({
            to: "/",
          });
        }}
      />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
