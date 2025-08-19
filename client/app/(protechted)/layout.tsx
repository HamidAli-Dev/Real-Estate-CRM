import React from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./_components/DashboardSidebar";
import { AuthProvider } from "@/context/auth-provider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "280px",
            } as React.CSSProperties
          }
        >
          <DashboardSidebar />
          <main className="flex-1 w-full">{children}</main>
        </SidebarProvider>
      </AuthProvider>
    </>
  );
};

export default DashboardLayout;
