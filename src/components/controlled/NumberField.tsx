import React from "react";
import { Controller, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { NUMBER } from "../../constants/RegexPattern";

interface NumberFieldProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: FieldPath<T>;
  control: Control<T>;
  rules?: object;
  label?: string;
  required?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

const NumberField = <T extends FieldValues>({
  name,
  control,
  label = "Number",
  required = false,
  labelClassName = "",
  inputClassName = "",
  disabled = false,
  onChange,
  ...rest
}: NumberFieldProps<T>) => {
  return (
    <div className="mb-4">
      {label && <Label label={label} required={required} labelClassName={labelClassName} />}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          pattern: {
            value: NUMBER,
            message: `${label} should contain only digits`,
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              id={name}
              type="text"
              inputMode="numeric"
              disabled={disabled}
              onChange={(e) => {
                if (disabled) return;
                field.onChange(e);
                if (onChange) onChange(e.target.value);
              }}
              aria-invalid={!!error}
              className={`w-full h-[39px] border p-2 rounded-md shadow-sm mb-1 mt-1
                ${error ? "border-red-500" : "border-gray-300"}
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}
                ${inputClassName}`}
            />
            {error && <Error error={error} />}
          </>
        )}
      />
    </div>
  );
};

export default NumberField;