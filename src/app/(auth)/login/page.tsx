import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <LoginForm />
    </main>
  );
}
