import React, { useEffect } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import Label from "../Label";
import Error from "./Error";
import { getPagesDataText } from "../../helpers/useTranslations";

interface PastDateFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  control: Control<T>;
  required?: boolean;
  disabled?: boolean;
  autoFillToday?: boolean;
}

const getTodayDate = (): string => new Date().toISOString().split("T")[0];

const PastDateField = <T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  disabled = false,
  autoFillToday = true,
  ...rest
}: PastDateFieldProps<T>) => {
  const { t } = useTranslation();
  const translations = getPagesDataText(t);
  const today = getTodayDate();

  const {
    field,
    fieldState: { error },
  } = useController({
    name: name as FieldPath<T>,
    control,
    rules: {
      required: required ? translations.Date_is_required : false,
      validate: (value) => {
        const fieldValue: unknown = value;
        if (!fieldValue && !required) return true;
        if (typeof fieldValue !== "string") return "Enter a valid date";
        return fieldValue <= today || "Date cannot be in the future";
      },
    },
  });

  useEffect(() => {
    if (!field.value && autoFillToday) {
      field.onChange(today);
    }
  }, [field.value, field.onChange, today, autoFillToday]);

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}

      <input
        {...field}
        {...rest}
        id={name}
        type="date"
        value={field.value || (autoFillToday ? today : "")}
        onChange={(e) => field.onChange(e.target.value)}
        max={today}
        disabled={disabled}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
        }`}
      />

      {error && <Error error={error} />}
    </div>
  );
};

export default PastDateField;