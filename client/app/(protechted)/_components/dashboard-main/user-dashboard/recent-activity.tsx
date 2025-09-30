"use client";
import React from "react";
import { User, Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityList from "./activity-list";

const mockPersonalActivities = [
  {
    id: "1",
    type: "LEAD_ASSIGNED",
    title: "New Lead Assigned",
    message: "John Smith has been assigned to you",
    category: "LEADS",
    priority: "MEDIUM",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    metadata: {
      leadName: "John Smith",
      leadEmail: "john.smith@email.com",
      leadPhone: "+1 (555) 123-4567",
    },
  },
  {
    id: "2",
    type: "PROPERTY_ADDED",
    title: "Property Added",
    message: "You added a new property listing",
    category: "PROPERTIES",
    priority: "LOW",
    isRead: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    metadata: {
      propertyAddress: "456 Oak Avenue",
      propertyPrice: "$320,000",
      propertyType: "Condo",
    },
  },
  {
    id: "4",
    type: "DEAL_STAGE_CHANGED",
    title: "Deal Updated",
    message: "Your deal moved to Negotiation stage",
    category: "DEALS",
    priority: "MEDIUM",
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    metadata: {
      dealValue: "$380,000",
      previousStage: "Contacted",
      newStage: "Negotiation",
    },
  },
  {
    id: "5",
    type: "PROPERTY_VIEWED",
    title: "Property Viewed",
    message: "You viewed property details",
    category: "PROPERTIES",
    priority: "LOW",
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    metadata: {
      propertyAddress: "789 Pine Street",
      propertyPrice: "$450,000",
    },
  },
];

const mockWorkspaceActivities = [
  {
    id: "1",
    type: "PROPERTY_LISTED",
    title: "New Property Listed",
    message: "Beautiful 3BR house listed in downtown",
    category: "PROPERTIES",
    priority: "MEDIUM",
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    user: { name: "Lisa Anderson", email: "lisa@example.com" },
    metadata: {
      propertyType: "House",
      bedrooms: 3,
      price: "$520,000",
      location: "Downtown",
    },
  },
  {
    id: "2",
    type: "USER_JOINED",
    title: "New Team Member",
    message: "Sarah Johnson joined the workspace",
    category: "USERS",
    priority: "LOW",
    isRead: true,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    user: { name: "Sarah Johnson", email: "sarah@example.com" },
    metadata: {
      role: "Agent",
      department: "Sales",
    },
  },
  {
    id: "3",
    type: "DEAL_CLOSED",
    title: "Deal Closed",
    message: "Major deal closed successfully",
    category: "DEALS",
    priority: "HIGH",
    isRead: true,
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    user: { name: "Mike Wilson", email: "mike@example.com" },
    metadata: {
      dealValue: "$750,000",
      clientName: "ABC Corporation",
      propertyType: "Commercial",
    },
  },
  {
    id: "4",
    type: "PROPERTY_PRICE_CHANGED",
    title: "Price Updated",
    message: "Property price has been updated",
    category: "PROPERTIES",
    priority: "MEDIUM",
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    user: { name: "Emily Davis", email: "emily@example.com" },
    metadata: {
      propertyAddress: "123 Main Street",
      oldPrice: "$400,000",
      newPrice: "$380,000",
    },
  },
  {
    id: "5",
    type: "ACTIVITY_SCHEDULED",
    title: "Meeting Scheduled",
    message: "Team meeting scheduled for tomorrow",
    category: "ACTIVITIES",
    priority: "LOW",
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    user: { name: "David Brown", email: "david@example.com" },
    metadata: {
      meetingType: "Team Meeting",
      scheduledTime: "2024-01-16T10:00:00Z",
      attendees: 8,
    },
  },
];

const RecentActivity = () => {
  const personalActivities = mockPersonalActivities;
  const workspaceActivities = mockWorkspaceActivities;

  return (
    <div className="space-y-6">
      {/* Personal Activity */}
      <ActivityList
        activities={personalActivities}
        title="Your Activity"
        icon={<User className="h-4 w-4" />}
        emptyMessage="No personal activity to display"
      />

      {/* Workspace Activity */}
      <ActivityList
        activities={workspaceActivities}
        title="Team Activity"
        icon={<Users className="h-4 w-4" />}
        emptyMessage="No team activity to display"
      />
    </div>
  );
};

export const RecentActivitySkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Personal Activity Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                {i < 2 && <Separator />}
              </div>
            ))}
          </div>
          <div className="p-3 border-t">
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>

      {/* Team Activity Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                {i < 2 && <Separator />}
              </div>
            ))}
          </div>
          <div className="p-3 border-t">
            <Skeleton className="h-3 w-16" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
