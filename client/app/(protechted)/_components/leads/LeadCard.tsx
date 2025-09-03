import React from "react";
import { format } from "date-fns";
import { Phone, Mail, Home, DollarSign } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/api.types";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      Hot: "bg-red-500 text-white",
      Warm: "bg-yellow-500 text-white",
      Cold: "bg-blue-500 text-white",
    };
    return colors[priority] || colors.Warm;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatContactInfo = (contactInfo: string) => {
    if (contactInfo.includes("@")) {
      return contactInfo; // Email
    }
    // Phone number - format if it's a valid number
    const cleaned = contactInfo.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(
        3,
        6
      )}-${cleaned.slice(6)}`;
    }
    return contactInfo;
  };

  const isEmail = (contactInfo: string) => contactInfo.includes("@");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-orange-300">
      <CardContent className="p-4 space-y-3 relative">
        {/* Priority Badge - Top Right */}
        <div className="absolute top-[-10px] right-2">
          <Badge
            className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeColor(
              lead.priority || "Warm"
            )}`}
          >
            {lead.priority || "medium"}
          </Badge>
        </div>
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-2 flex-nowrap">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={lead.avatar} alt={lead.name} />
              <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {lead.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {formatContactInfo(lead.contactInfo)}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
            <Phone className="w-4 h-4" />
            <span className="truncate">
              {lead.phone || formatContactInfo(lead.contactInfo)}
            </span>
          </div>
          {lead.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 min-w-0">
              <Mail className="w-4 h-4" />
              <span className="truncate">
                {isEmail(lead.contactInfo) ? lead.contactInfo : "N/A"}
              </span>
            </div>
          )}
        </div>

        {/* Property Information */}
        {lead.properties && lead.properties.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              <span className="truncate">
                {lead.properties.length === 1
                  ? lead.properties[0]?.property?.title || "Property Interest"
                  : `${lead.properties.length} Properties of Interest`}
              </span>
            </div>
            {lead.properties.length === 1 &&
              lead.properties[0]?.property?.price && (
                <div className="flex items-center space-x-2 text-sm font-semibold text-green-700">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatPrice(lead.properties[0].property.price)}</span>
                </div>
              )}
            {lead.properties.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {lead.properties.slice(0, 2).map((propertyLink, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    {propertyLink.property.title}
                  </Badge>
                ))}
                {lead.properties.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                  >
                    +{lead.properties.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Source, Agent and Budget */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Source: {lead.source || "Phone Call"}</span>
          <span>Agent: {lead.assignedTo?.name || "Unassigned"}</span>
        </div>
        {lead.budget && (
          <div className="flex items-center space-x-2 text-sm font-semibold text-green-700">
            <DollarSign className="w-4 h-4" />
            <span>Budget: {formatPrice(lead.budget)}</span>
          </div>
        )}

        {/* Dynamic Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Created and Last Contact */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created: {format(new Date(lead.createdAt), "MMM dd")}</span>
          <span>
            Last contact:{" "}
            {lead.lastContactedAt
              ? format(new Date(lead.lastContactedAt), "MMM dd")
              : format(new Date(lead.createdAt), "MMM dd")}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <Phone className="w-3 h-3 mr-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Mail className="w-3 h-3 mr-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-2 text-xs h-8 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={onClick}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
