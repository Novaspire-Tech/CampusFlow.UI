import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { AMOUNT } from "../../constants/RegexPattern";

interface AmountFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
    disabled?: boolean;
}

const AmountField = <T extends FieldValues>({
  name,
  control,
  label = "Amount",
  required = false,
  disabled = false,
  ...rest
}: AmountFieldProps<T>) => {
  return (
    <div className="mb-4">
      {label && <Label label={label} required={required} />}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          pattern: {
            value: AMOUNT,
            message: "Enter a valid amount (up to 2 decimal places)",
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              id={name}
              type="text"
              inputMode="decimal"
              placeholder={"Enter amount"}
              disabled={disabled}
              className={`mt-1 block w-full px-4 py-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
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

export default AmountField;