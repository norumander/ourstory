"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!displayName || displayName.trim().length < 1) {
      newErrors.displayName = "Display name is required";
    }
    if (displayName && displayName.trim().length > 50) {
      newErrors.displayName = "Display name must be 50 characters or fewer";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.field) {
        setErrors({ [data.field]: data.error });
      } else {
        setGlobalError(data.error || "Registration failed");
      }
      setLoading(false);
      return;
    }

    // Registration successful — redirect to login
    router.push("/login?registered=true");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500">
            Join ourstory and start making an impact
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {globalError && (
              <div
                className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700"
                role="alert"
              >
                {globalError}
              </div>
            )}
            <Input
              label="Display name"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              error={errors.displayName}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              error={errors.password}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
