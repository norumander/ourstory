import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-3xl font-bold text-warm-900">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-warm-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Back to home
      </Link>
    </div>
  );
}
