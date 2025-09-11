"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader, UserPlus, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/usePermission";
import { generateTemporaryPassword } from "@/lib/password-generator";
import { getWorkspaceRolesQueryFn, inviteUserMutationFn } from "@/lib/api";
import { inviteUserType } from "@/types/api.types";

const inviteUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface UserInvitationModalProps {
  workspaceId: string;
  onUserInvited?: () => void;
}

export const UserInvitationModal = ({
  workspaceId,
  onUserInvited,
}: UserInvitationModalProps) => {
  const [open, setOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);
  const { can } = usePermission();

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
  });

  // Fetch workspace roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["workspace-roles"],
    queryFn: () => getWorkspaceRolesQueryFn(workspaceId),
    enabled: open,
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: inviteUserMutationFn,
    onSuccess: (data) => {
      toast.success("User invited successfully");
      form.reset();
      setOpen(false);
      onUserInvited?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to invite user");
    },
  });

  const generatePassword = () => {
    const password = generateTemporaryPassword();
    setTempPassword(password);
    setPasswordCopied(false);
  };

  const copyPassword = async () => {
    if (tempPassword) {
      try {
        await navigator.clipboard.writeText(tempPassword);
        setPasswordCopied(true);
        toast.success("Password copied to clipboard");
        setTimeout(() => setPasswordCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy password");
      }
    }
  };

  const onSubmit = (data: InviteUserFormData) => {
    if (!tempPassword) {
      toast.error("Please generate a temporary password first");
      return;
    }

    inviteUserMutation.mutate({
      workspaceId,
      name: data.name,
      email: data.email,
      roleId: data.roleId,
      tempPassword,
    } as inviteUserType);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setTempPassword("");
      setPasswordCopied(false);
    }
  };

  if (!can.inviteUsers()) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Invite a new user to your workspace with a temporary password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter user's email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : (
                        rolesData?.map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <span>{role.name}</span>
                              {role.isSystem && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Temporary Password</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={tempPassword}
                  placeholder="Click 'Generate Password' to create a temporary password"
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="shrink-0"
                >
                  Generate
                </Button>
                {tempPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyPassword}
                    className="shrink-0"
                  >
                    {passwordCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Share this password with the user. They will be required to
                change it on first login.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={inviteUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteUserMutation.isPending || !tempPassword}
                className="gap-2"
              >
                {inviteUserMutation.isPending && (
                  <Loader className="h-4 w-4 animate-spin" />
                )}
                Invite User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
