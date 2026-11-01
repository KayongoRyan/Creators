import { cn } from "@/lib/utils/cn";

export const inspiredAccent = "#00EC97";

export const underlineInputClassName = cn(
  "block w-full border-0 border-b-[0.5px] border-black bg-transparent px-0 py-2.5 text-base text-gray-900",
  "placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0",
);

export const underlineInputErrorClassName = cn(
  underlineInputClassName,
  "border-red-500 focus:border-red-500",
);

export const underlineSelectClassName = cn(
  underlineInputClassName,
  "cursor-pointer appearance-none bg-[length:12px] bg-[right_0_center] bg-no-repeat pr-6",
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 fill=%27none%27%3E%3Cpath stroke=%27%23000%27 stroke-opacity=%27.45%27 stroke-width=%271.5%27 d=%27m1 1.5 5 5 5-5%27/%3E%3C/svg%3E')]",
);

type InspiredFormCardProps = {
  children: React.ReactNode;
  className?: string;
};

/** White card with thin black outline. */
export function InspiredFormCard({ children, className }: InspiredFormCardProps) {
  return (
    <div className={cn("border-[0.5px] border-black bg-white", className)}>{children}</div>
  );
}

type InspiredFormSplitProps = {
  aside: React.ReactNode;
  panel: React.ReactNode;
  footer?: React.ReactNode;
};

export function InspiredFormSplit({ aside, panel, footer }: InspiredFormSplitProps) {
  return (
    <div className="flex flex-col">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:p-10 xl:gap-14 xl:p-12">
        <div className="flex flex-col justify-center">{aside}</div>
        <div className="border-[0.5px] border-black bg-[#f3f3f3] p-6 sm:p-8">{panel}</div>
      </div>
      {footer ? (
        <div className="border-t-[0.5px] border-t-black px-6 py-8 sm:px-10 lg:px-12">{footer}</div>
      ) : null}
    </div>
  );
}

type InspiredFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function InspiredField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: InspiredFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="block text-sm italic text-gray-600">
        {label}
        {required ? <span className="not-italic text-gray-900">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs leading-5 text-gray-500">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InspiredChoiceGroupProps = {
  legend: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

export function InspiredChoiceGroup({ legend, required, error, children }: InspiredChoiceGroupProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm italic text-gray-600">
        {legend}
        {required ? <span className="not-italic text-gray-900">*</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

type InspiredChoiceProps = {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
};

export function InspiredChoice({ selected, onSelect, children }: InspiredChoiceProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "border-[0.5px] border-black px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-800 hover:bg-gray-50",
      )}
    >
      {children}
    </button>
  );
}

export function InspiredSubmit({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00EC97] px-8 text-base font-semibold text-gray-900 sm:w-fit",
        className,
      )}
    >
      {children}
      <span aria-hidden="true" className="text-lg leading-none">
        ↗
      </span>
    </button>
  );
}

export function InspiredContactRow({
  items,
}: {
  items: { label: string; value: string; href?: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-xs text-gray-500">{item.label}</p>
          {item.href ? (
            <a
              href={item.href}
              className="mt-1 block text-sm font-semibold text-gray-900 hover:underline"
            >
              {item.value}
            </a>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-900">{item.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
