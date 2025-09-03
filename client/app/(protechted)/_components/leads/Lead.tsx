"use client";
import { useRouter } from "next/navigation";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { Button } from "@/components/ui/button";
import TopBar from "../TopBar";
import { PipelineBoard } from "./PipelineBoard";

const Lead = () => {
  const router = useRouter();

  const { currentWorkspace, userWorkspaces, switchWorkspace, isLoading } =
    useWorkspaceContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Workspace Selected
          </h1>
          <p className="text-gray-600 mb-4">
            Please select a workspace to view leads
          </p>
          {userWorkspaces.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Available workspaces:</p>
              {userWorkspaces.map((userWorkspace) => (
                <Button
                  key={userWorkspace.workspace.id}
                  onClick={() => switchWorkspace(userWorkspace.workspace.id)}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  {userWorkspace.workspace.name}
                </Button>
              ))}
            </div>
          )}
          {userWorkspaces.length === 0 && (
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar />
      <div className="">
        <PipelineBoard workspaceId={currentWorkspace.workspace.id || ""} />;
      </div>
    </div>
  );
};

export default Lead;
