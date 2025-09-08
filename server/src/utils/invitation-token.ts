import crypto from "crypto";

/**
 * Generate a secure invitation token
 * @returns A cryptographically secure random token
 */
export const generateInvitationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generate invitation link with token
 * @param token The invitation token
 * @param baseUrl The base URL of the application
 * @returns Complete invitation URL
 */
export const generateInvitationLink = (
  baseUrl: string,
  token: string
): string => {
  return `${baseUrl}/auth/accept-invitation?token=${token}`;
};

/**
 * Calculate expiry time for invitation (30 minutes from now)
 * @returns Date object representing expiry time
 */
export const getInvitationExpiryTime = (): Date => {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
  return expiryTime;
};

/**
 * Check if invitation token is expired
 * @param expiryTime The expiry time of the invitation
 * @returns True if expired, false otherwise
 */
export const isInvitationExpired = (expiryTime: Date): boolean => {
  return new Date() > expiryTime;
};
