"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CATEGORIES = [
  "Medical",
  "Emergency",
  "Education",
  "Community",
  "Animals",
  "Environment",
  "Memorial",
  "Other",
];

function CreateFundraiserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCommunityId = searchParams.get("communityId") || "";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.data)) setCommunities(d.data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const story = formData.get("story") as string;
    const goalStr = formData.get("goalAmount") as string;
    const category = formData.get("category") as string;
    const imageUrl = (formData.get("imageUrl") as string) || undefined;
    const communityId = (formData.get("communityId") as string) || undefined;

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 5 || title.length > 100) {
      newErrors.title = "Title must be 5–100 characters";
    }
    if (!story || story.length < 50 || story.length > 5000) {
      newErrors.story = "Story must be 50–5000 characters";
    }
    const goalDollars = parseFloat(goalStr);
    if (!goalStr || isNaN(goalDollars) || goalDollars < 50 || goalDollars > 1000000) {
      newErrors.goalAmount = "Goal must be between $50 and $1,000,000";
    }
    if (!category) {
      newErrors.category = "Please select a category";
    }
    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      newErrors.imageUrl = "Please enter a valid URL";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const goalCents = Math.round(goalDollars * 100);

    const response = await fetch("/api/fundraisers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        story,
        goalAmount: goalCents,
        category,
        imageUrl,
        communityId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.field) {
        setErrors({ [data.field]: data.error });
      } else {
        setErrors({ title: data.error || "Failed to create fundraiser" });
      }
      setLoading(false);
      return;
    }

    router.push(`/fundraiser/${data.fundraiser.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">
            Start a fundraiser
          </h1>
          <p className="text-sm text-gray-500">
            Tell your story and set your goal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title"
              name="title"
              required
              placeholder="Give your fundraiser a title"
              error={errors.title}
            />

            <div>
              <label
                htmlFor="story"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Story
              </label>
              <textarea
                id="story"
                name="story"
                rows={6}
                required
                placeholder="Share why you're raising funds (at least 50 characters)..."
                className={`w-full rounded-lg border px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.story
                    ? "border-error-500 focus:ring-error-500"
                    : "border-gray-300 focus:ring-primary-500"
                }`}
              />
              {errors.story && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.story}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="goalAmount"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Goal amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="goalAmount"
                  name="goalAmount"
                  type="number"
                  step="1"
                  min="50"
                  max="1000000"
                  required
                  placeholder="5,000"
                  className={`w-full rounded-lg border px-3 py-2 pl-7 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.goalAmount
                      ? "border-error-500 focus:ring-error-500"
                      : "border-gray-300 focus:ring-primary-500"
                  }`}
                />
              </div>
              {errors.goalAmount && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.goalAmount}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                className={`w-full rounded-lg border px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.category
                    ? "border-error-500 focus:ring-error-500"
                    : "border-gray-300 focus:ring-primary-500"
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.category}
                </p>
              )}
            </div>

            <Input
              label="Hero image URL (optional)"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              error={errors.imageUrl}
            />

            <div>
              <label
                htmlFor="communityId"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Community (optional)
              </label>
              <select
                id="communityId"
                name="communityId"
                defaultValue={preselectedCommunityId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                <option value="">No community</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating..." : "Create fundraiser"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewFundraiserPage() {
  return (
    <Suspense>
      <CreateFundraiserForm />
    </Suspense>
  );
}
