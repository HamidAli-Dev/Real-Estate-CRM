export interface registerType {
  name: string;
  email: string;
  password: string;
}

export interface loginType {
  email: string;
  password: string;
}

export interface loginResponseType {
  user: userType;
  accessToken: string;
  refreshToken: string;
}

export interface userType {
  id: string;
  name: string;
  email: string;
  role?: {
    id: string;
    name: string;
    workspaceId: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  workspaceId?: string;
  workspaceName?: string;
  workspaceDomain?: string;
  mustUpdatePassword?: boolean;
}

export interface getCurrentUserResponseType {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    mustUpdatePassword: boolean;
    role: {
      id: string;
      name: string;
      isSystem: boolean;
    };
    workspaceId: string;
    workspaceName: string;
  };
}

export interface workspaceType {
  id: string;
  name: string;
  domain?: string;
  subscriptionPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface createWorkspaceType {
  name: string;
}

export interface editWorkspaceType {
  name: string;
}

export interface createWorkspaceResponseType {
  message: string;
  data: {
    workspace: {
      id: string;
      name: string;
      createdAt: string;
    };
    userRole: string;
  };
}

export interface editWorkspaceResponseType {
  message: string;
  data: {
    workspace: {
      id: string;
      name: string;
      updatedAt: string;
    };
  };
}

export interface userWorkspaceType {
  id: string;
  role: {
    id: string;
    name: string;
    workspaceId: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    rolePermissions?: {
      id: string;
      permission: {
        id: string;
        name: string;
        group?: string;
      };
    }[];
  };
  workspace: workspaceType;
  workspaceId: string;
  permissions?: rolePermissionType[];
}

export interface rolePermissionType {
  id: string;
  permission: string;
  createdAt: Date;
}

export interface workspaceUserType {
  id: string;
  role: {
    id: string;
    name: string;
    workspaceId: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    rolePermissions?: {
      id: string;
      permission: {
        id: string;
        name: string;
        group?: string;
      };
    }[];
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  permissions: rolePermissionType[];
}

export interface inviteUserType {
  workspaceId: string;
  name: string;
  email: string;
  roleId: string;
}

export interface updateUserRoleType {
  roleId: string;
  permissions: string[];
}

// Lead and Pipeline Types
export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    leads: number;
    deals: number;
  };
}

export interface Lead {
  id: string;
  name: string;
  contactInfo: string;
  phone?: string;
  pipelineStageId: string;
  assignedToId: string;
  workspaceId: string;
  notes?: string;
  source?: "Website" | "Referral" | "Social" | "Cold";
  priority?: "Hot" | "Warm" | "Cold";
  budget?: number;
  tags: string[];
  location?: string;
  avatar?: string;
  isHot?: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  pipelineStage: PipelineStage;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  properties: LeadProperty[];
  activities: Activity[];
}

export interface LeadProperty {
  id: string;
  leadId: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    city: string;
    address: string;
    images: PropertyImage[];
  };
}

export interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface Activity {
  id: string;
  type: "Call" | "Email" | "Meeting" | "Visit";
  scheduledAt: Date;
  status: "Pending" | "Completed";
  userId: string;
  leadId: string;
  workspaceId: string;
  user: {
    id: string;
    name: string;
  };
}

export interface CreateLeadData {
  name: string;
  contactInfo: string;
  phone?: string;
  pipelineStageId: string;
  assignedToId: string;
  notes?: string;
  source?: "Website" | "Referral" | "Social" | "Cold";
  priority?: "Hot" | "Warm" | "Cold";
  budget?: number;
  tags?: string[];
  propertyIds?: string[];
}

export interface UpdateLeadData {
  name?: string;
  contactInfo?: string;
  phone?: string;
  pipelineStageId?: string;
  assignedToId?: string;
  notes?: string;
  source?: "Website" | "Referral" | "Social" | "Cold";
  priority?: "Hot" | "Warm" | "Cold";
  budget?: number;
  tags?: string[];
  propertyIds?: string[];
}

export interface CreatePipelineStageData {
  name: string;
  color?: string;
}

export interface UpdatePipelineStageData {
  name?: string;
  color?: string;
}

export interface permissionGroupType {
  group: string;
  permissions: {
    value: string;
    label: string;
    description: string;
  }[];
}

export interface propertyType {
  id: string;
  title: string;
  description?: string;
  location: string;
  city: string;
  address?: string;
  price: number;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  status: "Available" | "Pending" | "Sold" | "Under_Offer" | "Rented";
  purpose: "forSale" | "forRent";
  propertyType:
    | "House"
    | "Apartment"
    | "Land"
    | "Commercial"
    | "Villa"
    | "Townhouse"
    | "Office"
    | "Shop"
    | "Warehouse";
  listedBy: userType;
  listedById: string;
  workspace: workspaceType;
  workspaceId: string;
  category: propertyCategoryType;
  categoryId: string;
  images: propertyImageType[];
  // New fields for wizard
  yearBuilt?: number;
  parkingSpaces?: number;
  features?: string[];
  zipCode?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export interface createPropertyType {
  title: string;
  description?: string;
  location: string;
  city: string;
  address?: string;
  price: number;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  status: "Available" | "Pending" | "Sold" | "Under_Offer" | "Rented";
  purpose: "forSale" | "forRent";
  propertyType:
    | "House"
    | "Apartment"
    | "Land"
    | "Commercial"
    | "Villa"
    | "Townhouse"
    | "Office"
    | "Shop"
    | "Warehouse";
  categoryId: string;
  images: File[];
  workspaceId: string;
  listedById: string;
  // New fields for wizard
  yearBuilt?: number;
  parkingSpaces?: number;
  features?: string[];
  zipCode?: string;
  state?: string;
}

export interface editPropertyType {
  title?: string;
  description?: string;
  location?: string;
  city?: string;
  address?: string;
  price?: number;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: "Available" | "Pending" | "Sold" | "Under_Offer" | "Rented";
  purpose?: "forSale" | "forRent";
  propertyType?:
    | "House"
    | "Apartment"
    | "Land"
    | "Commercial"
    | "Villa"
    | "Townhouse"
    | "Office"
    | "Shop"
    | "Warehouse";
  categoryId?: string;
  images?: File[];
  // New fields for wizard
  yearBuilt?: number;
  parkingSpaces?: number;
  features?: string[];
  zipCode?: string;
  state?: string;
}

export interface propertyCategoryType {
  id: string;
  category:
    | "House"
    | "Apartment"
    | "Land"
    | "Commercial"
    | "Villa"
    | "Townhouse";
  workspace: workspaceType;
  workspaceId: string;
  properties: propertyType[];
}

export interface propertyImageType {
  id: string;
  url: string;
  alt?: string;
  order: number;
  propertyId: string;
  createdAt: string;
}

// Notification Types
export type NotificationType =
  | "LEAD_ASSIGNED"
  | "LEAD_STAGE_CHANGED"
  | "LEAD_PRIORITY_CHANGED"
  | "LEAD_FOLLOW_UP_REMINDER"
  | "LEAD_CONVERTED_TO_DEAL"
  | "PROPERTY_LISTED"
  | "PROPERTY_PRICE_CHANGED"
  | "PROPERTY_STATUS_CHANGED"
  | "PROPERTY_VIEWING_SCHEDULED"
  | "PROPERTY_IMAGES_UPLOADED"
  | "DEAL_CREATED"
  | "DEAL_STAGE_CHANGED"
  | "DEAL_CLOSED"
  | "DEAL_NEGOTIATION_UPDATE"
  | "USER_INVITED"
  | "USER_JOINED"
  | "USER_ROLE_CHANGED"
  | "USER_LEFT_WORKSPACE"
  | "ACTIVITY_SCHEDULED"
  | "ACTIVITY_REMINDER"
  | "ACTIVITY_COMPLETED"
  | "WORKSPACE_SETTINGS_UPDATED"
  | "SYSTEM_ALERT"
  | "SUBSCRIPTION_UPDATE";

export type NotificationCategory =
  | "LEADS"
  | "PROPERTIES"
  | "DEALS"
  | "USERS"
  | "ACTIVITIES"
  | "WORKSPACE"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

export interface NotificationActionButton {
  label: string;
  action: string;
  url: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  isRead: boolean;
  readAt?: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionButtons?: NotificationActionButton[];
  metadata?: any;
  workspaceId: string;
  userId: string;
  triggeredById?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  triggeredBy?: {
    id: string;
    name: string;
  };
  workspace: {
    id: string;
    name: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface NotificationFilters {
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export interface UserNotificationPreferences {
  id: string;
  userId: string;
  leadNotifications: boolean;
  propertyNotifications: boolean;
  dealNotifications: boolean;
  userNotifications: boolean;
  activityNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceNotificationSettings {
  id: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  // branding
  notificationBranding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    companyName: string;
  };
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  workspaceId: string;
  userId: string;
  triggeredById?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionButtons?: NotificationActionButton[];
  metadata?: any;
}

export interface UpdateNotificationPreferencesData {
  leadNotifications?: boolean;
  propertyNotifications?: boolean;
  dealNotifications?: boolean;
  userNotifications?: boolean;
  activityNotifications?: boolean;
}
