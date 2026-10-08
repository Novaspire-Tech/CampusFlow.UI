import React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";

interface FutureDateFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  control: Control<T>;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
  disabled?: boolean; 
}

const FutureDateField = <T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  showError = true,
  errorMessage = "Date cannot be in the past",
  disabled = false, 
  ...rest
}: FutureDateFieldProps<T>) => {
  const today = new Date().toISOString().split("T")[0];

  const {
    field,
    fieldState: { error },
  } = useController({
    name: name as FieldPath<T>,
    control,
    rules: {
      ...(required ? { required: "Date is required" } : {}),
      validate: (value: string) => {
        if (!value) return !required || "Date is required";
        return value >= today || errorMessage;
      },
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e.target.value);
  };

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}

      <input
        {...field}
        {...rest}
        id={name}
        type="date"
        min={today}
        value={field.value || ""}
        onChange={handleInputChange}
        disabled={disabled} 
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`} 
      />

      {showError && error && <Error error={error} />}
    </div>
  );
};

export default FutureDateField;