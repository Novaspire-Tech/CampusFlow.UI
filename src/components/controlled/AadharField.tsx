import React from "react";
import {
  useController,
  type Control,
  type FieldValues,
  type FieldPath,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { AADHAR } from "../../constants/RegexPattern";
 
interface AadharFieldProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}
 
const AadharField = <T extends FieldValues>({
  name,
  control,
  label = "Aadhaar Number",
  required = false,
  disabled = false,
  ...rest
}: AadharFieldProps<T>) => {
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };
 
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      ...(required && { required: `${label} is required` }),
      validate: (value) => {
        const digits = String(value ?? "").replace(/\s/g, "");
 
        // Skip validation if field is empty and not required
        if (!required && !digits) return true;
 
        if (!AADHAR.test(digits)) return "Enter a valid 12-digit Aadhaar number";
        return true;
      },
    },
  });
 
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    field.onChange(raw);
  };
 
  return (
    <div className="mb-4">
      {label && <Label label={label} required={required} />}
 
      <input
        {...rest}
        id={name}
        type="text"
        inputMode="numeric"
        placeholder="XXXX XXXX XXXX"
        disabled={disabled}
        maxLength={14}
        value={formatAadhar(String(field.value ?? ""))}
        onChange={handleChange}
        onBlur={field.onBlur}
        ref={field.ref}
        aria-invalid={!!error}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
        }`}
      />
 
      {error && <Error error={error} />}
    </div>
  );
};
 
export default AadharField;