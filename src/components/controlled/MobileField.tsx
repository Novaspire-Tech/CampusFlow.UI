import React from "react";
import { useController, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { Mobile_Field } from "../../constants/RegexPattern";
 
interface MobileFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  control: Control<any>;
  required?: boolean;
  disabled?: boolean;
}
 
const MobileField: React.FC<MobileFieldProps> = ({
  name,
  label = "Mobile Number",
  control,
  required = false,
  disabled = false,
  ...rest
}) => {
  const rules = {
    ...(required && { required: `${label} is required` }),
    pattern: {
      value: Mobile_Field,
      message: `${label} must be a valid 10-digit number`,
    },
  };
 
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });
 
  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}
 
      <input
        {...field}
        {...rest}
        id={name}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
      />
 
      {error && <Error error={error} />}
    </div>
  );
};
 
export default MobileField;
 
 
