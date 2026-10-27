import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "primary" && "bg-neutral-900 text-white hover:bg-neutral-800",
        variant === "secondary" &&
          "border border-neutral-300 bg-white hover:bg-neutral-50",
        className,
      )}
      {...props}
    />
  );
}
