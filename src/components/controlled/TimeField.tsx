import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";

interface TimeFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
}

const TimeField = <T extends FieldValues>({
  name,
  control,
  label = "",
  required = false,
  ...rest
}: TimeFieldProps<T>) => {
  const { t } = useTranslation();
  const TimeText = getPagesDataText(t);

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} />}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required
            ? TimeText.This_field_is_required || "This field is required"
            : false,
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              id={name}
              type="time"
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

export default TimeField;
 