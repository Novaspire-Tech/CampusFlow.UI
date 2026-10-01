import React from "react";
import { useController, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";

interface CurrencyFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  control: Control<any>; // Replace `any` with your form type for stricter typing
  required?: boolean;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({
  name,
  label,
  control,
  required = false,
  ...rest
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: required ? "Currency is required" : false,
    },
  });

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "INR", name: "Indian Rupee" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
  ];

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}
      <select
        {...field}
        {...rest}
        id={name}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value="">Select Currency</option>
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
      {error && <Error error={error} />}
    </div>
  );
};

export default CurrencyField;
