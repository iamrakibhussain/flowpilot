"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid business email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [submissionFeedback, setSubmissionFeedback] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Architectural foundation verification handler
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmissionFeedback(
      `Form validation passed for ${data.email}. Backend authentication endpoint will be connected when flowpilot-backend is integrated.`
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign in to your workspace</CardTitle>
        <CardDescription>Enter your organization credentials to access FlowPilot.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {submissionFeedback && (
            <div
              role="status"
              className="border-primary/20 bg-primary/5 text-foreground rounded-md border p-3 text-xs"
            >
              <div className="flex gap-2">
                <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <p>{submissionFeedback}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-email" isRequired>
              Business Email
            </Label>
            <div className="relative">
              <Input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                hasError={!!errors.email}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" isRequired>
                Password
              </Label>
              <span className="text-muted-foreground cursor-pointer text-xs hover:underline">
                Forgot password?
              </span>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            <Lock className="mr-2 h-4 w-4" />
            Sign In to Workspace
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            Architecture verification shell — no credentials transmitted.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
