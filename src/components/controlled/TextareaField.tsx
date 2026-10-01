import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
} from "react-hook-form";
import { TextArea_Field } from "../../constants/RegexPattern";
import Label from "../Label";
import Error from "./Error";

interface TextareaFieldProps<T extends FieldValues>
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: FieldPath<T>;
  label?: string;
  control: Control<T>;
  required?: boolean;
  pattern?: {
    value: RegExp;
    message: string;
  };
}

const TextareaField = <T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  pattern,
  ...rest
}: TextareaFieldProps<T>) => {
  const isRequired = required || name === "description";

  const validationRules = {
    ...(isRequired && {
      required: `${label || "This field"} is required`,
    }),
    pattern: pattern ?? {
      value: TextArea_Field,
      message: `${label || "This field"} must contain only alphabets and spaces.`,
    },
  };

  return (
    <div className="mb-2">
      {label && <Label label={label} required={isRequired} />}

      <Controller
        name={name}
        control={control}
        rules={validationRules}
        render={({ field, fieldState: { error } }) => (
          <>
            <textarea
              {...field}
              {...rest}
              id={name}
              rows={4}
              className={`mt-1 block w-full px-4 py-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {error && <Error error={error} />}
          </>
        )}
      />
    </div>
  );
};

export default TextareaField;
