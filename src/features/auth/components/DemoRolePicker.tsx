"use client";

import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";
import { demoRoleOptions } from "../demoSession";

type DemoRolePickerProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  excludedRoles?: UserRole[];
};

export function DemoRolePicker({
  value,
  onChange,
  excludedRoles = [],
}: DemoRolePickerProps) {
  const options = demoRoleOptions.filter(
    (option) => !excludedRoles.includes(option.role),
  );
  const selected = options.find((option) => option.role === value);
  const columns = options.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm italic text-gray-600">Choose a demo workspace</legend>
      <div
        className={cn(
          "grid w-full overflow-hidden rounded-full bg-[#e8e8e8]",
          columns,
        )}
        role="group"
        aria-label="Workspace"
      >
        {options.map((option) => {
          const isSelected = value === option.role;
          const isBrand = option.role === "brand";

          return (
            <button
              key={option.role}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.role)}
              className={cn(
                "min-h-12 px-4 py-2.5 text-sm font-semibold",
                isSelected && isBrand && "bg-black text-white",
                isSelected && !isBrand && "bg-white text-black",
                !isSelected && "bg-transparent text-gray-600",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {selected ? (
        <p className="text-sm leading-5 text-gray-600">{selected.description}</p>
      ) : null}
    </fieldset>
  );
}
