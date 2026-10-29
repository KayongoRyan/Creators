"use client";

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
    const columns = options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

    return (
        <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-mkt-fg">
                Choose a demo workspace
            </legend>
            <div className={`grid gap-2 ${columns}`}>
                {options.map((option) => {
                    const isSelected = value === option.role;

                    return (
                        <label
                            key={option.role}
                            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-mkt-accent focus-within:ring-offset-2 ${isSelected
                                ? "border-mkt-accent bg-mkt-surface"
                                : "border-mkt-border bg-mkt-bg-muted hover:border-mkt-fg-subtle"
                                }`}
                        >
                            <input
                                type="radio"
                                name="demoRole"
                                value={option.role}
                                checked={isSelected}
                                onChange={() => onChange(option.role)}
                                className="mt-1 size-4 shrink-0 accent-mkt-accent"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-mkt-fg">
                                    {option.label}
                                </span>
                                <span className="mt-1 block text-xs leading-4 text-mkt-fg-muted">
                                    {option.description}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}