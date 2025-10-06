"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader, Eye, EyeOff } from "lucide-react";
import { CustomError } from "@/types/custom-error.type";

import { Button } from "@/components/ui/button";

interface LoginError extends CustomError {
  response?: {
    data?: {
      message?: string;
      errorCode?: string;
    };
  };
  data?: {
    message?: string;
    errorCode?: string;
  };
}
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginMutationFn } from "@/lib/api";
import FormHeading from "./FormHeading";

const LoginFormSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof LoginFormSchema>) {
    if (isPending) return;

    mutate(values, {
      onSuccess: async () => {
        toast.success("Success", {
          description: "Login successful",
        });

        try {
          // Invalidate specific queries to ensure fresh data
          await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
          await queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });

          // Small delay to ensure queries are properly invalidated
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check for redirect parameter
          const redirectTo = searchParams.get("redirect");
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error during post-login setup:", error);
          router.push("/dashboard");
        }
      },
      onError: (err: LoginError) => {
        // Extract the actual error message from the server response
        let errorMessage = "Something went wrong";

        if (err?.response?.data?.message) {
          // Direct server response message
          errorMessage = err.response.data.message;
        } else if (err?.data?.message) {
          // Error data message
          errorMessage = err.data.message;
        } else if (err?.message) {
          // Generic error message
          errorMessage = err.message;
        }

        toast.error("Login Failed", {
          description: errorMessage,
        });
      },
    });
  }

  return (
    <Card className="w-[26rem] px-3 py-2 p-7">
      <div className="flex flex-col gap-4 ">
        <CardHeader>
          <div className="flex flex-col items-center justify-center mb-4">
            <Image
              src={"/images/logo-2.png"}
              alt="logo"
              width={100}
              height={100}
              className="mb-3"
            />

            <CardDescription className="text-center">
              Your key to seamless property management.
            </CardDescription>
          </div>
          <FormHeading
            title="Login Now!"
            description="Login to continue to EstateElite CRM"
          />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="abc@gmail.com"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          placeholder="*********"
                          disabled={isPending}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          disabled={isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant={"customPrimary"}
                disabled={isPending}
              >
                {isPending && <Loader className="animate-spin" />}
                Login
              </Button>
              <p>Invited user default password: 123456</p>
            </form>

            <div className="mt-3">
              <CardDescription className="">
                Don&apos;t have an account?{" "}
                <Link
                  href={"/auth/register"}
                  className="text-cprimary hover:underline"
                >
                  Register
                </Link>
              </CardDescription>
            </div>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
};

export default LoginForm;
