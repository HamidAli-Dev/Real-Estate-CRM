"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { registerMutationFn } from "@/lib/api";
import FormHeading from "./FormHeading";

const RegisterFormSchema = z.object({
  name: z
    .string()
    .min(3, { error: "add minimun 3 characters" })
    .max(50, { error: "characters should not more then 50" }),
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const RegisterForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof RegisterFormSchema>) {
    if (isPending) return;

    mutate(values, {
      onSuccess: () => {
        toast.success("Success", {
          description: "Owner registered successfully",
        });

        setTimeout(() => router.push("/auth/login"), 1000);
      },
      onError: (err: any) => {
        toast.error("Error", {
          description: err.data.message,
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
            title="Register Now!"
            description="Register to continue to EstateElite CRM"
          />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-y-4"
            >
              <fieldset disabled={isPending} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} placeholder="jan dow" />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="abc@gmail.com" />
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
                  Register
                </Button>
              </fieldset>
            </form>

            <div className="mt-3">
              <CardDescription className="">
                Already have an account?{" "}
                <Link
                  href={"/auth/login"}
                  className="text-cprimary hover:underline"
                >
                  Login
                </Link>
              </CardDescription>
            </div>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
};

export default RegisterForm;
