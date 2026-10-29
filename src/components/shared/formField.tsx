import { cn } from "@/lib/utils/cn";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName = cn(
  "block w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-gray-900",
  "placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600",
);

export const inputErrorClassName = cn(inputClassName, "border-red-500 focus:border-red-500 focus:ring-red-500");
