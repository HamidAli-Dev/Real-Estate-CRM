"use client";
import { useAuthContext } from "@/context/auth-provider";

const Overview = () => {
  const { user } = useAuthContext();

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workspace Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back, {user?.name}! Manage your business workspaces and
          properties.
        </p>
      </div>

      {/* Workspaces Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Workspaces
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your business workspaces and access their dedicated
              dashboards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          Hi
        </div>
      </div>
    </div>
  );
};

export default Overview;
