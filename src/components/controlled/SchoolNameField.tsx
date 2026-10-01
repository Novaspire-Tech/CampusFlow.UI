import React from "react";
import { Controller, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import nameValidate from "../../common/nameValidate";
 
interface SchoolNameFieldProps {
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
 
const SchoolNameField: React.FC<SchoolNameFieldProps> = ({
  name,
  label = "School Name",
  placeholder = "Enter school name",
  control,
  pattern,
  patternMessage,
  required = false,
  labelClassName = "",
  inputClassName = "",
  ...rest
}) => {
  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} labelClassName={labelClassName} />}
      <Controller
        name={name}
        control={control}
        rules={nameValidate({
          required,
          label: label || "School Name",
          pattern,
          patternMessage,
        })}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              id={name}
              placeholder={placeholder}
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              } ${inputClassName}`}
               onChange={(e) => {
                field.onChange(e); 
              }}
            />
            <Error error={error} />
          </>
        )}
      />
    </div>
  );
};
 
export default SchoolNameField;