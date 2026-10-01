import React from "react";
import { Controller, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";

interface SchoolCodeFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  control: Control<any>;
  pattern?: RegExp;
  patternMessage?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const SchoolCodeField: React.FC<SchoolCodeFieldProps> = ({
  name,
  label = "School Code",
  placeholder = "Enter School Code",
  required = false,
  control,
  pattern = /^[A-Za-z0-9]{8,15}$/,
  patternMessage = "School code must be 8–15 letters or numbers only",
  labelClassName = "",
  inputClassName = "",
}) => {
  return (
    <div className="w-full">
      {label && (
        <Label
          required={required}
          label={label}
          labelClassName={labelClassName}
        />
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          pattern: { value: pattern, message: patternMessage },
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              id={name}
              type="text"
              placeholder={placeholder}
              className={`w-full border rounded-lg px-3 py-2 outline-none transition ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } ${inputClassName}`}
              onChange={(e) => {
                field.onChange(e); 
              }}
            />
            {error && <Error error={error} />}
          </>
        )}
      />
    </div>
  );
};

export default SchoolCodeField;
