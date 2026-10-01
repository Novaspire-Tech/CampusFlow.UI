import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PHONE_NUMBER } from "../../constants/RegexPattern";
import Error from "./Error";
import Label from "../Label";
import IconField from "../IconField";

interface PhoneFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  onEditClick?: () => void;
  showEditIcon?: boolean;
  editIconName?: string;
}

const Phone: React.FC<PhoneFieldProps> = ({
  name,
  label = "Phone Number",
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  readOnly = false,
  labelClassName = "",
  inputClassName = "",
  onEditClick,
  showEditIcon = false,
  editIconName = "FaEdit",
}) => {
  const { register, setValue, formState: { errors } } = useFormContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditable, setIsEditable] = useState(!readOnly);

  useEffect(() => {
    if (isEditable && inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditable]);

  const validatePhone = (value: string) => {
    const phone = value.replace(/\D/g, "");
    if (required && !phone) return "Phone number is required";
    if (phone && !PHONE_NUMBER.test(phone)) return "Enter valid 10-digit phone number";
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setValue(name, cleaned, { shouldValidate: true });
  };

  const handleEditClick = () => {
    setIsEditable(true);
    onEditClick?.();
  };

  useEffect(() => {
    setIsEditable(!readOnly);
  }, [readOnly]);

  const isFieldDisabled = disabled || (readOnly && !isEditable);
  const hasError = Boolean(errors[name]);

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} labelClassName={labelClassName} />}

      <div className="relative">
        <input
          id={name}
          type="tel"
          maxLength={10}
          placeholder={placeholder}
          {...register(name, { validate: validatePhone })}
          onChange={handleChange}
          disabled={isFieldDisabled}
          readOnly={readOnly && !isEditable}
          ref={inputRef}
          className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            hasError ? "border-red-500" : "border-gray-300"
          } ${inputClassName}`}
        />

        {showEditIcon && readOnly && !disabled && !isEditable && (
          <button
            type="button"
            onClick={handleEditClick}
            className="absolute right-3 top-3 text-gray-400 hover:text-blue-500"
          >
            <IconField name={editIconName} size={16} />
          </button>
        )}
      </div>

      {errors[name]?.message && <Error error={{ message: errors[name].message as string }} />}
    </div>
  );
};

export default Phone;
