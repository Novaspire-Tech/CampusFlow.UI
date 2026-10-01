import React from "react";
import { useController, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { convertToDateInputFormat } from "./DateField";
 
interface BirthDateFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  control: Control<any>;
  required?: boolean;
  showError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}
 
const BirthDateField: React.FC<BirthDateFieldProps> = ({
  name,
  label,
  control,
  required = false,
  showError = true,
  disabled = false,
  errorMessage = "Must be at least 3 years old",
  ...rest
}) => {
  const today = new Date().toISOString().split("T")[0];
 
 
 
 
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 3);
  const minDateString = minDate.toISOString().split("T")[0];
 
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      ...(required && { required: `${label || "Date"} is required` }),
      validate: (value: string) => {
        if (!value) return !required || `${label || "Date"} is required`;
        return (value <= today && value <= minDateString) || errorMessage;
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
        max={today}
        value={convertToDateInputFormat(field.value || "")}
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
export default BirthDateField;
 