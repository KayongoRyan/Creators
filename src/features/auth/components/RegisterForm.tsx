"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  InspiredChoice,
  InspiredChoiceGroup,
  InspiredField,
  InspiredSubmit,
  underlineInputClassName,
} from "@/components/shared/inspiredForm";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { creatorNicheGroups } from "@/features/creators/data/creatorNiches";
import { signupWithPassword } from "@/lib/api";
import { isValidEmail } from "@/lib/validators";
import type { UserRole } from "@/types";

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
  const [pending, setPending] = useState(false);

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
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

        let address = "";
        let birthDate = "";
        let phone = "";
        if (role === "creator") {
          address = String(data.get("address") ?? "").trim();
          birthDate = String(data.get("birthDate") ?? "");
          phone = String(data.get("phone") ?? "").trim();

          if (!address || !birthDate || !phone || selectedNiches.length === 0) {
            setError("Complete your contact details and choose at least one niche.");
            return;
          }

          const imageFile = data.get("profilePicture");
          if (imageFile instanceof File && imageFile.size > 2 * 1024 * 1024) {
            setError("Choose a profile picture smaller than 2 MB.");
            return;
          }
        }

        setPending(true);
        setError("");
        void signupWithPassword({
          email,
          password,
          role,
          displayName,
        })
          .then((result) => {
            saveDemoSession({
              role: result.role as UserRole,
              displayName,
              email: result.email,
              ...(role === "creator"
                ? {
                    address,
                    birthDate,
                    phone,
                    niches: selectedNiches,
                    ...(avatarDataUrl ? { avatarDataUrl } : {}),
                  }
                : {}),
            });
            router.replace(getRoleHome(result.role as UserRole));
          })
          .catch((reason) => {
            setError(reason instanceof Error ? reason.message : "Could not create that account.");
          })
          .finally(() => setPending(false));
      }}
    >
      <DemoRolePicker value={role} onChange={setRole} excludedRoles={["admin"]} />

      <InspiredField
        id="displayName"
        label={role === "creator" ? "Full name" : "Business name"}
        required
      >
        <input
          id="displayName"
          name="displayName"
          autoComplete={role === "creator" ? "name" : "organization"}
          placeholder={role === "creator" ? "Your name" : "Your company or brand"}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
          className={underlineInputClassName}
        />
      </InspiredField>

      {role === "creator" ? (
        <>
          <div className="flex items-center gap-4 border-b border-black/10 pb-6">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/15 bg-white text-lg font-semibold text-gray-900">
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
            <InspiredField id="profilePicture" label="Profile picture">
              <input
                id="profilePicture"
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
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
            </InspiredField>
          </div>

          <InspiredField id="address" label="Address" required>
            <input
              id="address"
              name="address"
              autoComplete="street-address"
              placeholder="Street address, city, country"
              required
              className={underlineInputClassName}
            />
          </InspiredField>

          <div className="grid gap-6 sm:grid-cols-2">
            <InspiredField id="birthDate" label="Date of birth" required>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                autoComplete="bday"
                required
                className={underlineInputClassName}
              />
            </InspiredField>
            <InspiredField id="phone" label="Phone number" required>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 0100"
                required
                className={underlineInputClassName}
              />
            </InspiredField>
          </div>

          <InspiredChoiceGroup
            legend="Your niches"
            required
            error={
              error.includes("niche") && selectedNiches.length === 0
                ? "Choose at least one niche."
                : undefined
            }
          >
            {creatorNicheGroups.flatMap((group) =>
              group.niches.map((niche) => {
                const isSelected = selectedNiches.includes(niche.label);
                return (
                  <InspiredChoice
                    key={niche.label}
                    selected={isSelected}
                    onSelect={() =>
                      setSelectedNiches((current) =>
                        isSelected
                          ? current.filter((value) => value !== niche.label)
                          : [...current, niche.label],
                      )
                    }
                  >
                    {niche.label}
                  </InspiredChoice>
                );
              }),
            )}
          </InspiredChoiceGroup>
          <p aria-live="polite" className="-mt-2 text-sm font-medium text-gray-700">
            {selectedNiches.length} selected
          </p>
        </>
      ) : null}

      <InspiredField id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={underlineInputClassName}
        />
      </InspiredField>

      <InspiredField id="password" label="Password" required hint="At least 8 characters.">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={underlineInputClassName}
        />
      </InspiredField>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <InspiredSubmit disabled={pending}>
        {pending ? "Working…" : `Create ${role} account`}
      </InspiredSubmit>

      <p className="text-xs leading-5 text-gray-500">
        Frontend demo only. Account details stay in this browser; passwords are not stored.
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
