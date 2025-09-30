import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Home,
  MapPin,
  Plus,
  TrendingUp,
  User,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: Date;
  user?: { name: string; email: string };
  metadata: {
    leadName?: string;
    propertyAddress?: string;
    propertyPrice?: string;
    dealValue?: string;
    clientName?: string;
  };
}

const getActivityIcon = (type: string, category: string) => {
  switch (category) {
    case "LEADS":
      return <User className="h-4 w-4" />;
    case "PROPERTIES":
      switch (type) {
        case "PROPERTY_ADDED":
          return <Plus className="h-4 w-4" />;
        case "PROPERTY_VIEWED":
          return <Eye className="h-4 w-4" />;
        case "PROPERTY_LISTED":
          return <Home className="h-4 w-4" />;
        case "PROPERTY_PRICE_CHANGED":
          return <Edit className="h-4 w-4" />;
        default:
          return <Home className="h-4 w-4" />;
      }
    case "DEALS":
      switch (type) {
        case "DEAL_CLOSED":
          return <CheckCircle className="h-4 w-4" />;
        case "DEAL_STAGE_CHANGED":
          return <TrendingUp className="h-4 w-4" />;
        default:
          return <DollarSign className="h-4 w-4" />;
      }
    case "ACTIVITIES":
      switch (type) {
        case "ACTIVITY_SCHEDULED":
          return <Calendar className="h-4 w-4" />;
        case "ACTIVITY_COMPLETED":
          return <CheckCircle className="h-4 w-4" />;
        default:
          return <Clock className="h-4 w-4" />;
      }
    case "USERS":
      switch (type) {
        case "USER_JOINED":
          return <UserPlus className="h-4 w-4" />;
        case "USER_LEFT_WORKSPACE":
          return <Users className="h-4 w-4" />;
        default:
          return <Users className="h-4 w-4" />;
      }
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getActivityColor = (category: string, priority: string) => {
  const baseColors = {
    LEADS: "bg-blue-50 text-blue-700 border-blue-200",
    PROPERTIES: "bg-green-50 text-green-700 border-green-200",
    DEALS: "bg-purple-50 text-purple-700 border-purple-200",
    ACTIVITIES: "bg-orange-50 text-orange-700 border-orange-200",
    USERS: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const priorityColors = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM:
      baseColors[category as keyof typeof baseColors] ||
      "bg-gray-50 text-gray-700 border-gray-200",
    LOW: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    priorityColors[priority as keyof typeof priorityColors] ||
    baseColors[category as keyof typeof baseColors]
  );
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "destructive";
    case "MEDIUM":
      return "secondary";
    case "LOW":
      return "outline";
    default:
      return "secondary";
  }
};

const ActivityList = ({
  activities,
  title,
  icon,
  emptyMessage,
  itemsPerPage = 3,
}: {
  activities: ActivityItem[];
  title: string;
  icon: React.ReactNode;
  emptyMessage: string;
  itemsPerPage?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {currentActivities.map((activity, index) => (
            <div key={activity.id}>
              <div className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full border ${getActivityColor(
                      activity.category,
                      activity.priority
                    )}`}
                  >
                    {getActivityIcon(activity.type, activity.category)}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </h4>
                          {!activity.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(activity.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>{activity.user.name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <Badge
                        variant={getPriorityBadgeVariant(activity.priority)}
                        className="text-xs h-5"
                      >
                        {activity.priority}
                      </Badge>
                    </div>

                    {/* Additional Metadata */}
                    {activity.metadata && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activity.metadata.leadName && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{activity.metadata.leadName}</span>
                          </div>
                        )}
                        {activity.metadata.propertyAddress && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-32">
                              {activity.metadata.propertyAddress}
                            </span>
                          </div>
                        )}
                        {activity.metadata.dealValue && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>{activity.metadata.dealValue}</span>
                          </div>
                        )}
                        {activity.metadata.propertyPrice && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>{activity.metadata.propertyPrice}</span>
                          </div>
                        )}
                        {activity.metadata.clientName && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{activity.metadata.clientName}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {index < currentActivities.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, activities.length)}{" "}
                of {activities.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-6 w-6 p-0 text-xs"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityList;
