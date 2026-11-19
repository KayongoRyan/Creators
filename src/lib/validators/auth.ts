export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function passwordValidationErrors(value: string): string[] {
  const errors: string[] = [];
  if (value.length < 8) {
    errors.push("Use a password with at least 8 characters.");
  }
  if (value !== value.trim() || /\s/.test(value)) {
    errors.push("Password must not contain spaces.");
  }
  if (!/[A-Z]/.test(value)) {
    errors.push("Include at least one uppercase letter.");
  }
  if (!/[a-z]/.test(value)) {
    errors.push("Include at least one lowercase letter.");
  }
  if (!/\d/.test(value)) {
    errors.push("Include at least one number.");
  }
  return errors;
}

export function isStrongEnoughPassword(value: string) {
  return passwordValidationErrors(value).length === 0;
}

export function firstPasswordError(value: string): string | null {
  return passwordValidationErrors(value)[0] ?? null;
}