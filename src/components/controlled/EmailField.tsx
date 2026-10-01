import { Controller, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import Label from "../Label";
import { EMAIL } from "../../constants/RegexPattern";
import Error from "./Error";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";

interface EmailFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
  onChange?: (value: string) => void;
  labelClassName?: string;
  inputClassName?: string;
}

const EmailField = <T extends FieldValues>({
  name,
  control,
  label = "Email",
  placeholder,
  required = false,
  disabled = false,
  onFocus,
  onChange,
  labelClassName = "",
  inputClassName = "",
}: EmailFieldProps<T>) => {
  const { t } = useTranslation();
  const Email_is_requiredText = getPagesDataText(t).Email_is_required;

  return (
    <div className="mb-4">
      {label && (
        <Label
          label={label}
          required={required}
          labelClassName={labelClassName}
        />
      )}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? Email_is_requiredText : false,
          validate: (value: string) => {
            const email = value?.toLowerCase().trim();
            if (!required && !email) return true;
            if (!EMAIL.test(email))
              return "Must be a valid email format (e.g., user123@domain.com)";
            if (!email.endsWith(".com"))
              return "Email must end with .com";
            return true;
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <div
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm 
                ${
                  error ? "border-red-500" : "border-gray-300"
                } 
                focus-within:ring-2 focus-within:ring-blue-500
                 ${disabled ? 'bg-gray-100  opacity-70' : ''}
                ${inputClassName}`}
            >
              <input
                {...field}
                id={name}
                type="email"
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-transparent outline-none ${disabled ? 'cursor-not-allowed' : ''}`}
                onChange={(e) => {
                  if (disabled) return;
                  const value = e.target.value.toLowerCase();
                  field.onChange(value);
                  onChange?.(value);
                }}
                onFocus={onFocus}
              />
            </div>

            {error && <Error error={error} />}
          </>
        )}
      />
    </div>
  );
};

export default EmailField;
