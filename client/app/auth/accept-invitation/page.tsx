"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  getInvitationDetailsQueryFn,
  acceptInvitationMutationFn,
} from "@/lib/api";

const acceptInvitationSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

type AcceptInvitationForm = {
  password?: string;
  confirmPassword?: string;
};

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch invitation details
  const {
    data: invitationData,
    isLoading: isLoadingInvitation,
    error: invitationError,
  } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationDetailsQueryFn(token!),
    enabled: !!token,
    retry: false,
  });

  const form = useForm<AcceptInvitationForm>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Accept invitation mutation
  const { mutate: acceptInvitationMutation, isPending: isAccepting } =
    useMutation({
      mutationFn: acceptInvitationMutationFn,
      onSuccess: (data) => {
        if (data.requiresPassword) {
          toast.success("Account created successfully!", {
            description: "You can now log in to your account.",
          });
        } else {
          toast.success("Welcome to the workspace!", {
            description: "You have successfully joined the workspace.",
          });
        }
        // Redirect to login page
        router.push("/auth/login?message=invitation-accepted");
      },
      onError: (error: any) => {
        toast.error("Failed to accept invitation", {
          description: error.message,
        });
      },
    });

  const onSubmit = (data: AcceptInvitationForm) => {
    if (!token) {
      toast.error("Invalid invitation link");
      return;
    }

    acceptInvitationMutation({
      token,
      password: data.password || undefined,
    });
  };

  // Handle missing token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Invitation Link
              </h2>
              <p className="text-gray-600 mb-4">
                This invitation link is invalid or has expired.
              </p>
              <Button onClick={() => router.push("/auth/login")}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle loading state
  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading invitation details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (invitationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invitation Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                This invitation link is invalid, expired, or has already been
                used.
              </p>
              <Button onClick={() => router.push("/auth/login")}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Accept Invitation
          </CardTitle>
          <p className="text-gray-600">
            Set up your password to join the workspace
          </p>
        </CardHeader>
        <CardContent>
          {/* Invitation Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Invitation Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Name:</span>
                <span className="text-blue-900 font-medium">
                  {invitationData?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Email:</span>
                <span className="text-blue-900 font-medium">
                  {invitationData?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Workspace:</span>
                <span className="text-blue-900 font-medium">
                  {invitationData?.workspace?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Role:</span>
                <Badge variant="secondary" className="text-xs">
                  {invitationData?.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Invited by:</span>
                <span className="text-blue-900 font-medium">
                  {invitationData?.invitedBy?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {invitationData?.requiresPassword ? (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              disabled={isAccepting}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isAccepting}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              disabled={isAccepting}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              disabled={isAccepting}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    You already have an account! Click the button below to join
                    the workspace.
                  </p>
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                disabled={isAccepting || !invitationData}
                onClick={() => {
                  console.log("Button clicked!", {
                    isAccepting,
                    hasInvitationData: !!invitationData,
                    requiresPassword: invitationData?.requiresPassword,
                    formValid: form.formState.isValid,
                    formErrors: form.formState.errors,
                  });

                  if (!token) {
                    toast.error("Invalid invitation link");
                    return;
                  }

                  if (invitationData?.requiresPassword) {
                    // If password is required, validate form first
                    form.handleSubmit(onSubmit)();
                  } else {
                    // If no password required, submit directly
                    acceptInvitationMutation({
                      token,
                      password: undefined,
                    });
                  }
                }}
              >
                {isAccepting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    {invitationData?.requiresPassword
                      ? "Setting up account..."
                      : "Joining workspace..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {invitationData?.requiresPassword
                      ? "Accept Invitation"
                      : "Join Workspace"}
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={() => router.push("/auth/login")}
              >
                Sign in
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
