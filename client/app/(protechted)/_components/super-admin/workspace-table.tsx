"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Mail } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  plan: string;
  users: number;
  properties: number;
  revenue: string;
  status: "active" | "suspended" | "trial";
  owner: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  lastActivity: string;
}

const WorkspaceTable = () => {
  // Mock data
  const workspaces: Workspace[] = [
    {
      id: "1",
      name: "ABC Realty Group",
      domain: "abcrealty.com",
      plan: "Pro",
      users: 24,
      properties: 156,
      revenue: "$2,400",
      status: "active",
      owner: {
        name: "John Smith",
        email: "john@abcrealty.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=John%20Smith",
      },
      createdAt: "2024-01-15",
      lastActivity: "2 hours ago",
    },
    {
      id: "2",
      name: "XYZ Properties",
      domain: "xyzproperties.com",
      plan: "Standard",
      users: 12,
      properties: 89,
      revenue: "$1,200",
      status: "active",
      owner: {
        name: "Sarah Johnson",
        email: "sarah@xyzproperties.com",
        avatar:
          "https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Johnson",
      },
      createdAt: "2024-01-10",
      lastActivity: "1 day ago",
    },
    {
      id: "3",
      name: "Metro Real Estate",
      domain: "metrorealestate.com",
      plan: "Basic",
      users: 8,
      properties: 45,
      revenue: "$800",
      status: "trial",
      owner: {
        name: "Mike Wilson",
        email: "mike@metrorealestate.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Mike%20Wilson",
      },
      createdAt: "2024-01-20",
      lastActivity: "3 hours ago",
    },
    {
      id: "4",
      name: "Elite Properties",
      domain: "eliteproperties.com",
      plan: "Pro",
      users: 18,
      properties: 203,
      revenue: "$1,800",
      status: "suspended",
      owner: {
        name: "Emily Davis",
        email: "emily@eliteproperties.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Emily%20Davis",
      },
      createdAt: "2024-01-05",
      lastActivity: "1 week ago",
    },
    {
      id: "5",
      name: "Sunrise Realty",
      domain: "sunriserealty.com",
      plan: "Standard",
      users: 15,
      properties: 112,
      revenue: "$1,500",
      status: "active",
      owner: {
        name: "David Brown",
        email: "david@sunriserealty.com",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=David%20Brown",
      },
      createdAt: "2024-01-12",
      lastActivity: "30 minutes ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "trial":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Trial
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Pro":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Pro
          </Badge>
        );
      case "Standard":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Standard
          </Badge>
        );
      case "Basic":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Basic
          </Badge>
        );
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Workspace Management
          </CardTitle>
          <Button size="sm">Export Data</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={workspace.owner.avatar}
                          alt={workspace.owner.name}
                        />
                        <AvatarFallback>
                          {workspace.owner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workspace.domain}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(workspace.plan)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{workspace.users}</span>
                      <span className="text-muted-foreground">users</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {workspace.properties}
                      </span>
                      <span className="text-muted-foreground">properties</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {workspace.revenue}
                    </span>
                    <div className="text-xs text-muted-foreground">/month</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(workspace.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {workspace.lastActivity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Owner
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Suspend Workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing 1-5 of 1,247 workspaces
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceTable;
