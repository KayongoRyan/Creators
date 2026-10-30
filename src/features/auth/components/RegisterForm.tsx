"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { creatorNicheGroups } from "@/features/creators/data/creatorNiches";
import { routes } from "@/config/routes";
import { marketingType } from "@/lib/marketing";
import { cn } from "@/lib/utils/cn";
import { isValidEmail } from "@/lib/validators";
import type { UserRole } from "@/types";

const profileInputClass = cn(
  marketingType.formInput,
  "border-mkt-border bg-mkt-bg-muted text-mkt-fg placeholder:text-mkt-fg-subtle focus:border-mkt-accent",
);

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the selected image."));
    };
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

type RegisterFormProps = {
  initialRole: Extract<UserRole, "creator" | "brand">;
};

export function RegisterForm({ initialRole }: RegisterFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>();
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);

  return (
    <form
      noValidate
      className="mt-8 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const displayName = String(data.get("displayName") ?? "").trim();
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");

        if (!displayName) {
          setError(
            role === "creator"
              ? "Enter your name to continue."
              : "Enter your business name to continue.",
          );
          return;
        }

        if (!isValidEmail(email)) {
          setError("Enter a valid email address.");
          return;
        }

        if (password.length < 8) {
          setError("Use a password with at least 8 characters.");
          return;
        }

        if (role === "creator") {
          const address = String(data.get("address") ?? "").trim();
          const birthDate = String(data.get("birthDate") ?? "");
          const phone = String(data.get("phone") ?? "").trim();

          if (!address || !birthDate || !phone || selectedNiches.length === 0) {
            setError("Complete your contact details and choose at least one niche.");
            return;
          }

          const imageFile = data.get("profilePicture");
          if (
            imageFile instanceof File &&
            imageFile.size > 2 * 1024 * 1024
          ) {
            setError("Choose a profile picture smaller than 2 MB.");
            return;
          }

          saveDemoSession({
            role,
            displayName,
            email,
            address,
            birthDate,
            phone,
            niches: selectedNiches,
            ...(avatarDataUrl ? { avatarDataUrl } : {}),
          });
        } else {
          saveDemoSession({ role, displayName, email });
        }

        router.replace(routes.public.home);
      }}
    >
      <DemoRolePicker
        value={role}
        onChange={setRole}
        excludedRoles={["admin"]}
      />
      <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
        {role === "creator" ? "Full name" : "Business name"}
        <input
          name="displayName"
          autoComplete={role === "creator" ? "name" : "organization"}
          placeholder={
            role === "creator" ? "Your name" : "Your company or brand"
          }
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
          className={cn(
            marketingType.formInput,
            "border-mkt-border bg-mkt-bg-muted text-mkt-fg placeholder:text-mkt-fg-subtle focus:border-mkt-accent",
          )}
        />
      </label>
      {role === "creator" && (
        <section className="flex flex-col gap-5 border-t border-mkt-border pt-6">
          <div>
            <h2 className="text-lg font-semibold text-mkt-fg">
              Your creator profile
            </h2>
            <p className="mt-1 text-sm leading-5 text-mkt-fg-muted">
              Help brands understand who you are and what you create.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-mkt-border bg-mkt-surface text-lg font-semibold text-mkt-fg">
              {avatarDataUrl ? (
                <Image
                  src={avatarDataUrl}
                  alt="Profile picture preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                displayInitials(displayName)
              )}
            </div>
            <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
              Profile picture <span className="text-mkt-fg-muted">(optional)</span>
              <input
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    setError("Choose an image file for your profile picture.");
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    setError("Choose a profile picture smaller than 2 MB.");
                    return;
                  }
                  setAvatarDataUrl(await readImageAsDataUrl(file));
                  setError("");
                }}
                className="block w-full text-sm text-mkt-fg-muted file:mr-3 file:rounded-full file:border-0 file:bg-mkt-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-mkt-fg"
              />
            </label>
          </div>

          <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
            Address
            <input
              name="address"
              autoComplete="street-address"
              placeholder="Street address, city, country"
              required
              className={profileInputClass}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
              Date of birth
              <input
                name="birthDate"
                type="date"
                autoComplete="bday"
                required
                className={profileInputClass}
              />
            </label>
            <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
              Phone number
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 0100"
                required
                className={profileInputClass}
              />
            </label>
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-mkt-fg">
              Your niches
            </legend>
            <p className="-mt-3 text-sm leading-5 text-mkt-fg-muted">
              Choose every topic you create content about.
            </p>
            <p aria-live="polite" className="text-sm font-medium text-mkt-fg">
              {selectedNiches.length} selected
            </p>
            {creatorNicheGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-2 text-sm font-semibold text-mkt-fg-muted">
                  {group.label}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.niches.map((niche) => {
                    const isSelected = selectedNiches.includes(niche.label);
                    return (
                      <label
                        key={niche.label}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-mkt-accent ${isSelected
                          ? "border-mkt-accent bg-mkt-surface"
                          : "border-mkt-border bg-mkt-bg-muted hover:border-mkt-fg-subtle"
                          }`}
                      >
                        <input
                          type="checkbox"
                          name="niches"
                          value={niche.label}
                          checked={isSelected}
                          onChange={(event) =>
                            setSelectedNiches((current) =>
                              event.target.checked
                                ? [...current, niche.label]
                                : current.filter((value) => value !== niche.label),
                            )
                          }
                          className="mt-1 size-4 shrink-0 accent-mkt-accent"
                        />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="text-sm font-medium text-mkt-fg">
                            {niche.label}
                          </span>
                          <span className="text-xs leading-5 text-mkt-fg-muted">
                            {niche.examples}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </fieldset>
        </section>
      )}
      <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={cn(
            marketingType.formInput,
            "border-mkt-border bg-mkt-bg-muted text-mkt-fg placeholder:text-mkt-fg-subtle focus:border-mkt-accent",
          )}
        />
      </label>
      <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
        Password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={cn(
            marketingType.formInput,
            "border-mkt-border bg-mkt-bg-muted text-mkt-fg placeholder:text-mkt-fg-subtle focus:border-mkt-accent",
          )}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-mkt-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-mkt-accent px-5 text-sm font-semibold text-mkt-on-accent transition-colors hover:bg-mkt-accent-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-accent"
      >
        Create {role} account
      </button>
      <p className="text-xs leading-5 text-mkt-fg-muted">
        Frontend demo only. Account details stay in this browser; passwords are
        not stored.
      </p>
    </form>
  );
}

function displayInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
