import React, { useState } from "react";
import { validatePassword } from "../../constants/RegexPattern";
import IconField from "../IconField";
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
} from "react-hook-form";
import Error from "./Error";
import Label from "../Label";
 
interface PasswordProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  validation?: boolean;
  className?: string;
  control: Control<T>;
  name: FieldPath<T>;
  rules?: any;
  inputClassName?: string;
}
 
const Password = <T extends FieldValues>({
  className = "text-gray-700",
  validation = false,
  required = false,
  control,
  name,
  label,
  rules,
  inputClassName = "",
  labelClassName = "",
  ...props
}: PasswordProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [, setShowTooltip] = useState(false);
  const [, setPasswordValid] = useState({
    number: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
    minLength: false,
    maxLength: false,
  });
 
  return (
    <div className={className}>
      {/* FIXED HERE */}
      <Label label={label} required={required} labelClassName={labelClassName} />
 
      <Controller
        name={name}
        control={control}
        rules={
          rules
            ? rules
            : validation
            ? {
                validate: (value) => {
                  const result = validatePassword(value);
                  setPasswordValid(result.checks);
                  return result.isValid || "Invalid password";
                },
              }
            : { required: "Password is required" }
        }
        render={({ field, fieldState: { error } }) => (
          <div className="mb-6 relative">
            <div className="relative">
              <input
                {...field}
                {...props}
                id={name}
                type={showPassword ? "text" : "password"}
                onChange={(e) => {
                  field.onChange(e);
                  if (validation) {
                    const result = validatePassword(e.target.value);
                    setPasswordValid(result.checks);
                  }
                }}
                onFocus={() => validation && setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                onMouseEnter={() => validation && setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? "border-red-500" : "border-gray-300"
                } ${inputClassName}`}
                
              />
 
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 px-2 flex items-center text-md text-gray-500"
              >
                <IconField
                  name={showPassword ? "FaEyeSlash" : "FaRegEye"}
                  size={18}
                />
              </button>
            </div>
 
            {error && <Error error={error} />}
          </div>
        )}
      />
    </div>
  );
};
 
export default Password;
 
 