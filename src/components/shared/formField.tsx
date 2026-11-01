import { cn } from "@/lib/utils/cn";
import {
  InspiredField,
  underlineInputClassName,
  underlineInputErrorClassName,
} from "@/components/shared/inspiredForm";

export {
  InspiredField,
  underlineInputClassName,
  underlineInputErrorClassName,
} from "@/components/shared/inspiredForm";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <InspiredField id={id} label={label} error={error}>
      {children}
    </InspiredField>
  );
}

export const inputClassName = underlineInputClassName;

export const inputErrorClassName = underlineInputErrorClassName;
