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
  role?: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceDomain?: string;
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
  role: string;
  workspace: workspaceType;
  permissions?: rolePermissionType[];
}

export interface rolePermissionType {
  id: string;
  permission: string;
  createdAt: Date;
}

export interface workspaceUserType {
  id: string;
  role: string;
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
  role: "Admin" | "Manager" | "Agent";
  permissions: string[];
}

export interface updateUserRoleType {
  role: "Admin" | "Manager" | "Agent";
  permissions: string[];
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
