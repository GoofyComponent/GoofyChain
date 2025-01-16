import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { User } from "@/hooks/hooksTypes";
import { Link } from "@tanstack/react-router";

export type NavBarItem = {
  title: string;
  url: string;
  items: {
    title: string;
    url: string;
    isActive?: boolean;
  }[];
};

const navBar: NavBarItem[] = [
  {
    title: "Dashboard",
    url: "/_authenticated/dashboard",
    items: [
      {
        title: "Overview",
        url: "#",
        isActive: true,
      },
      {
        title: "Analytics",
        url: "#",
      },
    ],
  },
];

export function AppSidebar({
  user,
  logout,
  ...props
}: { user: User; logout: () => void } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser user={user} logout={logout} />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {navBar.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
