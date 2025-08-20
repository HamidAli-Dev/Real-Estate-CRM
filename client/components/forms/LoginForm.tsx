"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
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
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

        router.push("/dashboard");
      },
      onError: (err) => {
        toast.error("Error", {
          description: err.message || "Something went wrong",
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
                      <Input
                        type="password"
                        {...field}
                        placeholder="*********"
                        disabled={isPending}
                      />
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
            </form>

            <div className="mt-3">
              <CardDescription className="">
                Don't have an account?{" "}
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
