import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <RegisterForm />
    </main>
  );
}
