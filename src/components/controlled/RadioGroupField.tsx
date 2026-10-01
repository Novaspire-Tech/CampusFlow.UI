import React from "react";
import { useController, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";

interface Option {
  label: string;
  value: string;
}

interface RadioGroupFieldProps {
  name: string;
  label?: string;
  control: Control<any>; 
  options?: Option[];
  required?: boolean;
}

const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  name,
  label,
  control,
  options = [],
  required = false,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: required ? { required: `${label || "Field"} is required` } : {},
  });

  return (
    <div className="mb-2">
        {label && 
      <Label label={label} required={required}
       />}

      <div className="flex gap-6">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value={option.value}
              checked={field.value === option.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              className="accent-slate-700"
            />
            {option.label}
          </label>
        ))}
      </div>
       {error && 
            <Error error={error} 
            />}
    </div>
  );
};

export default RadioGroupField;
