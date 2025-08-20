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
  domain: string;
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface createWorkspaceType {
  name: string;
  domain: string;
}

export interface editWorkspaceType {
  name: string;
  domain?: string;
}

export interface createWorkspaceResponseType {
  message: string;
  data: {
    workspace: {
      id: string;
      name: string;
      domain: string;
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
      domain: string;
      updatedAt: string;
    };
  };
}

export interface userWorkspaceType {
  id: string;
  role: string;
  workspace: workspaceType;
}
