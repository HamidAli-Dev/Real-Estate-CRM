"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Key,
  Sparkles,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { changePasswordMutationFn } from "@/lib/api";

const passwordChangeSchema = z
  .object({
    email: z.string().min(1, "Email is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface MandatoryPasswordChangeModalProps {
  open: boolean;
  onPasswordChanged?: () => void;
}

export const MandatoryPasswordChangeModal = ({
  open,
  onPasswordChanged,
}: MandatoryPasswordChangeModalProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const form = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  // Watch new password for strength calculation
  const newPassword = form.watch("newPassword");
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword || ""));
  }, [newPassword]);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePasswordMutationFn,
    onSuccess: () => {
      setIsAnimating(true);
      toast.success(
        "Password changed successfully! Welcome to your workspace!"
      );
      setTimeout(() => {
        form.reset();
        onPasswordChanged?.();
        setIsAnimating(false);
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to change password"
      );
    },
  });

  const onSubmit = (data: PasswordChangeFormData) => {
    changePasswordMutation.mutate({
      email: data.email,
      newPassword: data.newPassword,
    });
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Good";
    return "Strong";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Custom backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.preventDefault()}
      />

      {/* Modal content */}
      <div
        className="relative max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden p-1">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse rounded-lg" />

          {/* Header with impressive styling */}
          <div className="relative z-10 text-center space-y-3 pb-4 px-6 pt-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Security Setup Required
              </h2>
              <p className="text-gray-600 text-base">
                For your security, you must change your password before
                accessing your workspace.
              </p>
            </div>

            {/* Security badge */}
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200"
              >
                <Lock className="h-3 w-3 mr-1" />
                Mandatory Security Update
              </Badge>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 relative z-10 px-6 pb-6"
            >
              {/* Current Password */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={"email"}
                          placeholder="Enter your email"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                          className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="h-4 w-4" />
                      New Secure Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                          className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={changePasswordMutation.isPending}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>

                    {/* Password strength indicator */}
                    {field.value && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Password strength:
                          </span>
                          <span
                            className={`font-medium ${
                              passwordStrength < 40
                                ? "text-red-600"
                                : passwordStrength < 80
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className="h-2" />
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                          className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={changePasswordMutation.isPending}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Security requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                  <AlertTriangle className="h-4 w-4" />
                  Password Requirements
                </div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  disabled={
                    changePasswordMutation.isPending ||
                    passwordStrength < 80 ||
                    !form.formState.isValid
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating Security...
                    </>
                  ) : isAnimating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Welcome to Your Workspace!
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Complete Security Setup
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
