import React, { useEffect } from "react";
import { Controller, type Control } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";

interface DateFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  required?: boolean;
  disabled?: boolean;
  onlyToday?: boolean;
  [key: string]: any;
}

export const convertToDateInputFormat = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
  return "";
};

const getTodayDate = (): string => new Date().toISOString().split("T")[0];

const DateField: React.FC<DateFieldProps> = ({
  name,
  label,
  control,
  required = false,
  disabled = false,
  onlyToday = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const translations = getPagesDataText(t);
  const today = getTodayDate();

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? translations.Date_is_required : false,
        }}
        render={({ field, fieldState: { error } }) => {
          // 🔥 Yeh logic state update karega taaki "Required" error na aaye
          useEffect(() => {
            if (!field.value) {
              field.onChange(today);
            }
          }, [field.value, field.onChange, today]);

          const displayValue = field.value
            ? convertToDateInputFormat(field.value)
            : today;

          return (
            <>
              <input
                {...field}
                {...rest}
                id={name}
                type="date"
                value={displayValue}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={disabled}
                min={onlyToday ? today : rest.min}
                max={onlyToday ? today : rest.max}
                className={`mt-1 block w-full px-4 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
                }`}
              />
              {error && <Error error={error} />}
            </>
          );
        }}
      />
    </div>
  );
};

export default DateField;