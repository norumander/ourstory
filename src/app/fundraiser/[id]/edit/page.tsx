"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CATEGORIES = [
  "Medical", "Emergency", "Education", "Community",
  "Animals", "Environment", "Memorial", "Other",
];

export default function EditFundraiserPage() {
  const router = useRouter();
  const params = useParams();
  const fundraiserId = params.id as string;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fundraiser, setFundraiser] = useState<{
    title: string; story: string; goalAmount: number;
    category: string; imageUrl: string; communityId: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/fundraisers/${fundraiserId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setFundraiser({
            title: d.data.title,
            story: d.data.story,
            goalAmount: d.data.goalAmount,
            category: d.data.category,
            imageUrl: d.data.imageUrl || "",
            communityId: d.data.communityId || "",
          });
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [fundraiserId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const story = formData.get("story") as string;
    const goalStr = formData.get("goalAmount") as string;
    const category = formData.get("category") as string;
    const imageUrl = formData.get("imageUrl") as string;

    const goalDollars = parseFloat(goalStr);
    const goalCents = Math.round(goalDollars * 100);

    const response = await fetch(`/api/fundraisers/${fundraiserId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, story,
        goalAmount: goalCents,
        category,
        imageUrl: imageUrl || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        setErrors({ title: "You can only edit fundraisers you created" });
      } else if (data.field) {
        setErrors({ [data.field]: data.error });
      } else {
        setErrors({ title: data.error || "Failed to update" });
      }
      setLoading(false);
      return;
    }

    router.push(`/fundraiser/${fundraiserId}`);
    router.refresh();
  }

  if (fetching) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-warm-500">Loading...</p>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-warm-500">Fundraiser not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Card>
        <CardHeader>
          <h1 className="font-serif text-2xl font-bold text-warm-900">
            Edit fundraiser
          </h1>
          <p className="text-sm text-warm-500">
            Update your fundraiser details
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title"
              name="title"
              required
              defaultValue={fundraiser.title}
              error={errors.title}
            />

            <div>
              <label htmlFor="story" className="mb-1 block text-sm font-medium text-warm-700">
                Story
              </label>
              <textarea
                id="story"
                name="story"
                rows={6}
                required
                defaultValue={fundraiser.story}
                className={`w-full rounded-lg border px-3 py-2 text-base text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.story ? "border-error-500 focus:ring-error-500" : "border-warm-300 focus:ring-primary-500"
                }`}
              />
              {errors.story && (
                <p className="mt-1 text-sm text-error-600" role="alert">{errors.story}</p>
              )}
            </div>

            <div>
              <label htmlFor="goalAmount" className="mb-1 block text-sm font-medium text-warm-700">
                Goal amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500">$</span>
                <input
                  id="goalAmount"
                  name="goalAmount"
                  type="number"
                  step="1"
                  min="50"
                  max="1000000"
                  required
                  defaultValue={fundraiser.goalAmount / 100}
                  className={`w-full rounded-lg border px-3 py-2 pl-7 text-base text-warm-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.goalAmount ? "border-error-500 focus:ring-error-500" : "border-warm-300 focus:ring-primary-500"
                  }`}
                />
              </div>
              {errors.goalAmount && (
                <p className="mt-1 text-sm text-error-600" role="alert">{errors.goalAmount}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-warm-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue={fundraiser.category}
                className="w-full rounded-lg border border-warm-300 px-3 py-2 text-base text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Hero image URL"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              defaultValue={fundraiser.imageUrl}
              error={errors.imageUrl}
            />

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/fundraiser/${fundraiserId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
