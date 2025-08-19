import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Route protection utilities
export const protectedRoutes = [
  "/dashboard",
  "/analytics",
  "/properties",
  "/clients",
  "/settings",
];
export const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/",
  "/pricing",
  "/faq",
];

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route);
}

export function shouldRedirectToDashboard(pathname: string): boolean {
  return isPublicRoute(pathname) && pathname !== "/";
}
