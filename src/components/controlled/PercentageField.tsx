import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";

interface PercentageFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
}

const PercentageField = <T extends FieldValues>({
  name,
  control,
  label = "Percentage",
  required = false,
  ...rest
}: PercentageFieldProps<T>) => {
  return (
    <div className="mb-2">
      {label && <Label label={`${label} (%)`} required={required} />}
      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                ...{ required: `${label} is required` },
                validate: (value) => {
                  const num = Number(value);
                  if (isNaN(num) || num < 1 || num > 100) {
                    return "Enter a valid percentage (1-100)";
                  }
                  return true;
                },
              }
            : undefined
        }
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              id={name}
              type="text"
              className={`w-full h-[39px] border p-2 rounded-md shadow-sm mb-1 
                   ${error ? "border-red-500" : "border-gray-300"} 
                  focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {error && <Error error={error} />}
          </>
        )}
      />
    </div>
  );
};

export default PercentageField;
