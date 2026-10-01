import React, { type FC, type InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";
import Label from "../Label";
import { PHONE_NUMBER } from "../../constants/RegexPattern";
import Error from "./Error";
 
interface PhoneNumberFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  onValidation?: (isValid: boolean) => void;
  labelClassName?: string;
  inputClassName?: string;
}
 
const PhoneNumberField: FC<PhoneNumberFieldProps> = ({
  name,
  label = "Phone Number",
  required = false,
  placeholder = "Enter phone number",
  maxLength = 10,
  onValidation,
  labelClassName = "",
  inputClassName = "",
  ...props
}) => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();
 
  const validatePhone = (input: string) => {
    const phone = input.replace(/\D/g, "");
    if (!PHONE_NUMBER.test(phone)) {
      onValidation?.(false);
      return "Enter valid 10-digit phone number";
    }
    onValidation?.(true);
    return true;
  };
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setValue(name, cleaned);
  };
 
  return (
    <div className="mb-1 lg:mb-4">
      {label && <Label label={label} required={required} labelClassName={labelClassName} />}
      <input
        id={name}
        type="tel"
        placeholder={placeholder}
        maxLength={maxLength}
        {...register(name, { validate: validatePhone })}
        onChange={handleChange}
        className={`w-full h-[39px] border p-2 rounded-md shadow-sm mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } ${inputClassName}`}
        {...props}
      />
      {errors[name]?.message && <Error error={{ message: errors[name].message as string }} />}
    </div>
  );
};
 
export default PhoneNumberField;
 