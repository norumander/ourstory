"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DonatePage() {
  const router = useRouter();
  const params = useParams();
  const fundraiserId = params.id as string;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get("amount") as string;
    const message = (formData.get("message") as string) || undefined;

    // Client-side validation
    const amount = parseFloat(amountStr);
    const newErrors: Record<string, string> = {};

    if (!amountStr || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (amount > 10000) {
      newErrors.amount = "Maximum donation is $10,000";
    } else if (amount < 1) {
      newErrors.amount = "Minimum donation is $1";
    }

    if (message && message.length > 500) {
      newErrors.message = "Message must be 500 characters or fewer";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const amountCents = Math.round(amount * 100);

    const response = await fetch(`/api/fundraisers/${fundraiserId}/donate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountCents, message }),
    });

    if (!response.ok) {
      const data = await response.json();
      if (response.status === 401) {
        router.push(`/login?callbackUrl=/fundraiser/${fundraiserId}/donate`);
        return;
      }
      setErrors({ amount: data.error || "Donation failed" });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-12">
        <Card className="w-full text-center">
          <CardContent className="py-12">
            <div className="mb-4 text-5xl">💜</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thank you for your generosity!
            </h1>
            <p className="mt-2 text-gray-600">
              Your mock donation has been recorded.
            </p>
            <div className="mt-6">
              <Link href={`/fundraiser/${fundraiserId}`}>
                <Button>Back to fundraiser</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        {/* Mock payment banner — GR-SEC-3 */}
        <div className="rounded-t-xl bg-accent-500 px-6 py-4 text-center">
          <p className="text-sm font-bold text-gray-900">
            ⚠️ This is a demo — no real money is being charged
          </p>
        </div>

        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Make a donation</h1>
          <p className="text-sm text-gray-500">
            Your contribution makes a difference
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  required
                  placeholder="25.00"
                  className={`w-full rounded-lg border px-3 py-2 pl-7 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.amount
                      ? "border-error-500 focus:ring-error-500"
                      : "border-gray-300 focus:ring-primary-500"
                  }`}
                  aria-invalid={errors.amount ? "true" : undefined}
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                />
              </div>
              {errors.amount && (
                <p id="amount-error" className="mt-1 text-sm text-error-600" role="alert">
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Message (optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                maxLength={500}
                placeholder="Write an encouraging message..."
                className={`w-full rounded-lg border px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.message
                    ? "border-error-500 focus:ring-error-500"
                    : "border-gray-300 focus:ring-primary-500"
                }`}
                aria-invalid={errors.message ? "true" : undefined}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Processing..." : "Donate"}
            </Button>
          </form>

          <Link
            href={`/fundraiser/${fundraiserId}`}
            className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to fundraiser
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
