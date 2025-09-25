"use client";
import { User, Mail, Building, Shield } from "lucide-react";
import { format } from "date-fns";

import { useAuthContext } from "@/context/auth-provider";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import TopBar from "../../TopBar";

const UserDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const { currentWorkspace, isLoading: isWorkspaceLoading } =
    useWorkspaceContext();
  const { isLoading: isAccessLoading } = useDashboardAccess();

  if (isAuthLoading || isWorkspaceLoading || isAccessLoading) {
    return <UserDashboardSkeleton />;
  }

  if (!user || !currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Unable to load user dashboard. Please try again later.</p>
      </div>
    );
  }

  const userData = user.user;
  const workspaceData = currentWorkspace;
  const permissions = workspaceData.role.rolePermissions || [];

  return (
    <div className="space-y-8">
      <div className="">
        <TopBar />
        <h1 className="text-3xl font-bold">Welcome, {userData.name}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s your personal dashboard with important information and
          permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`}
                  />
                  <AvatarFallback>
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{userData.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {userData.email}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {workspaceData.workspace.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{workspaceData.role.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <Badge
                      key={permission.id}
                      variant="secondary"
                      className="py-2 px-3 justify-between"
                    >
                      <span className="font-medium">
                        {permission.permission.name}
                      </span>
                      {permission.permission.group && (
                        <span className="text-xs bg-background px-2 py-1 rounded">
                          {permission.permission.group}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No specific permissions assigned. Contact your workspace
                  administrator for more information.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Workspace Information Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Workspace Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Workspace Name</h4>
                  <p className="text-muted-foreground">
                    {workspaceData.workspace.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Your Role</h4>
                  <p className="text-muted-foreground">
                    {workspaceData.role.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Member Since</h4>
                  <p className="text-muted-foreground">
                    {format(
                      new Date(workspaceData.role.createdAt),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Total Permissions</h4>
                  <p className="text-muted-foreground">
                    {permissions.length} permissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const UserDashboardSkeleton = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
