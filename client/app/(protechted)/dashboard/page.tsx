"use client";
import { useState, useEffect } from "react";
import { Building2, Plus } from "lucide-react";

import Overview from "../_components/Overview";
import TopBar from "../_components/TopBar";
import CreateWorkspaceDialog from "../_components/workspace/CreateWorkspaceDialog";
import DashboardContent from "../_components/DashboardContent";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardPage = () => {
  const { currentWorkspace, userWorkspaces, isLoading } = useWorkspaceContext();
  const [selectedRole, setSelectedRole] = useState<
    "Owner" | "Manager" | "Agent"
  >("Owner");

  const [showCreateWorkspaceDialog, setShowCreateWorkspaceDialog] =
    useState(false);

  // Show create workspace dialog when user has no workspaces
  useEffect(() => {
    if (!isLoading && userWorkspaces.length === 0) {
      setShowCreateWorkspaceDialog(true);
    }
  }, [isLoading, userWorkspaces.length]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show create workspace prompt if user has no workspaces
  if (userWorkspaces.length === 0) {
    return (
      <div>
        <TopBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mx-auto mb-6 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              To get started, you need to create your first workspace. This is
              where you'll manage your properties, leads, and deals.
            </p>
            <Button
              onClick={() => setShowCreateWorkspaceDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Workspace
            </Button>
          </div>
        </div>

        {/* Create Workspace Dialog */}
        <CreateWorkspaceDialog
          isOpen={showCreateWorkspaceDialog}
          onClose={() => setShowCreateWorkspaceDialog(false)}
        />
      </div>
    );
  }

  // Show normal dashboard when user has a workspace
  return (
    <div>
      <TopBar />
      <div className="p-6">
        {/* Role Selector for Demo */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Demo: Switch Role:
            </span>
            <Select
              value={selectedRole}
              onValueChange={(value: "Owner" | "Manager" | "Agent") =>
                setSelectedRole(value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-500">
              (This is for demonstration purposes)
            </span>
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        <DashboardContent role={selectedRole} />
      </div>
    </div>
  );
};

export default DashboardPage;
