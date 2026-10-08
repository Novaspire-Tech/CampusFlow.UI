import React from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { IFSC_Code } from "../../constants/RegexPattern";

interface IFSCInputFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  control: Control<T>;
  placeholder?: string;
  required?: boolean;
}

const IFSCInputField = <T extends FieldValues>({
  name,
  label,
  control,
  placeholder = "Eg: SBIN0000123",
  required = false,
  ...props
}: IFSCInputFieldProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: name as FieldPath<T>,
    control,
    rules: {
      required: required ? "IFSC code is required" : false,
      pattern: {
        value: IFSC_Code,
        message: "Invalid IFSC format (eg: ABCD0123456)",
      },
      validate: (value) => {
        const fieldValue: unknown = value;
        if (!fieldValue) return true;
        if (typeof fieldValue !== "string") return "Invalid IFSC format (eg: ABCD0123456)";
        return fieldValue.length === 11 || "IFSC must be 11 characters";
      },
    },
    defaultValue: "" as FieldPathValue<T, FieldPath<T>>,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    field.onChange(value);
  };

  return (
    <div className="mb-4">
      {label && <Label label={label} required={required} />}

      <input
        {...field}
        {...props}
        id={name}
        type="text"
        onChange={handleChange}
        maxLength={11}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
      />

      {error && <Error error={error} />}
    </div>
  );
};

export default IFSCInputField;
