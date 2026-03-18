"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-3xl font-bold text-warm-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-warm-600">
        We encountered an unexpected error. Please try again, and if the problem
        persists, contact support.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Try again
      </button>
    </div>
  );
}
