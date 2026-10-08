import React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";

interface BirthDateFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  control: Control<T>;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  placeholder?: string;
}
const toInputFormat = (value: string): string => {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.split("T")[0];
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day   = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
};
const toComparableDate = (value: string): string => {
  if (!value) return "";

  // ISO datetime
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.split("T")[0];

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value;
};

const StaffBirthDate = <T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  showError = true,
  disabled = false,
  errorMessage = "Must be at least 21 years old",
  placeholder = "mm/dd/yyyy",
  ...rest
}: BirthDateFieldProps<T>) => {
  const minDateString = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 21);
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day   = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const {
    field,
    fieldState: { error },
  } = useController({
    name: name as FieldPath<T>,
    control,
    rules: {
      required: required ? `${label || "Date"} is required` : false,
      validate: (value) => {
        if (!value) {
          return required ? `${label || "Date"} is required` : true;
        }

        const comparable = toComparableDate(value);

        if (!comparable) return true;
        return comparable <= minDateString || errorMessage;
      },
    },
  });

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}

      <input
        {...rest}
        id={name}
        type="date"
        max={minDateString}
        placeholder={placeholder}
        value={toInputFormat(field.value ?? "")}
        onChange={(e) => {
          field.onChange(e.target.value);
        }}
        onBlur={field.onBlur}
        ref={field.ref}
        onFocus={(e) => e.target.showPicker?.()}
        disabled={disabled}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
        }`}
        style={{ colorScheme: "light" }}
      />

      {showError && error && <Error error={error} />}
    </div>
  );
};

export default StaffBirthDate;