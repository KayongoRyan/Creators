import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Creators</h1>
      <p className="text-neutral-600">
        Connect brands with creators for campaigns, submissions, and payouts.
      </p>
      <div className="flex gap-4">
        <Link
          href="/apply"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Apply as creator
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
