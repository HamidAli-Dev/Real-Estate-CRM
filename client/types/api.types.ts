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
}

export interface workspaceType {
  id: string;
  name: string;
  domain: string;
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
}
