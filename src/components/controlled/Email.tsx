import { useEffect, useRef, useState } from "react";
import { Controller, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import { EMAIL } from "../../constants/RegexPattern";
import Label from "../Label";
import Error from "./Error";
import IconField from "../IconField";

interface EmailFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onEditClick?: () => void;
  showEditIcon?: boolean;
  editIconName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const Email = <T extends FieldValues>({
  name,
  control,
  label = "Email Id",
  placeholder = "Enter email",
  required = false,
  disabled = false,
  readOnly = false,
  onEditClick,
  showEditIcon = false,
  editIconName = "FaEdit",
  labelClassName = "",
  inputClassName = "",
}: EmailFieldProps<T>) => {

  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditable, setIsEditable] = useState(!readOnly);

  useEffect(() => {
    if (isEditable && inputRef.current) {
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditable]);

  const handleEditClick = () => {
    setIsEditable(true);
    onEditClick?.();
  };

  useEffect(() => {
    setIsEditable(!readOnly);
  }, [readOnly]);

  const isFieldDisabled = disabled || (readOnly && !isEditable);

  return (
    <div className="mb-2">
      {label && (
        <Label
          label={label}
          required={required}
          labelClassName={labelClassName}
        />
      )}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? "Email is required" : false,
          validate: (value: string) => {
            const email = value?.trim().toLowerCase();
            if (!required && !email) return true;
            if (!EMAIL.test(email)) return "Invalid email format";
            return true;
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="relative">
              <input
                {...field}
                ref={inputRef}
                id={name}
                type="text"
                inputMode="email"
                placeholder={placeholder}
                disabled={isFieldDisabled}
                readOnly={readOnly && !isEditable}
                className={`mt-1 block w-full px-4 py-2 border rounded-md text-white bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-500"
              } ${inputClassName}`}
                onChange={(e) => field.onChange(e.target.value.toLowerCase())}
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

            {error && <Error error={error} />}
          </>
        )}
      />
    </div>
  );
};

export default Email;
