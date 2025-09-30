import React, { Suspense } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "../_components/DashboardSidebar";
import { WorkspaceProvider } from "@/context/workspace-provider";
import { SocketProvider } from "@/context/socket-provider";
import ProtectedRouteProtection from "../_components/ProtectedRouteProtection";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <WorkspaceProvider>
        <SocketProvider>
          <ProtectedRouteProtection />
          <SidebarProvider
            className="overflow-x-hidden"
            style={
              {
                "--sidebar-width": "280px",
              } as React.CSSProperties
            }
          >
            <DashboardSidebar />
            <main className="flex-1 w-full min-w-0 overflow-x-hidden px-6 pt-30 pb-6">
              {children}
            </main>
          </SidebarProvider>
        </SocketProvider>
      </WorkspaceProvider>
    </Suspense>
  );
};

export default DashboardLayout;
