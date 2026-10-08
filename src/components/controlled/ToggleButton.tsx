import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import Error from "./Error";
import Label from "../Label";

interface ToggleButtonProps<T extends FieldValues> {
  name: string;
  label?: string;
  control?: Control<T>;
  required?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

const ToggleButton = <T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  required = false,
  value,
  onChange,
}: ToggleButtonProps<T>) => {
  const inputId = `toggle-${name}`;

  const renderToggle = (checked: boolean, onToggle: () => void) => (
    <div className="flex items-center gap-3">
      <div
        className="relative inline-flex items-center cursor-pointer"
        onClick={onToggle}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          readOnly
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? "bg-blue-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );

  return (
      <div className="mb-2 flex items-center justify-center gap-4">
      {label && (
        <Label label={label} required={required} labelClassName="mb-1" />
      )}

      {control ? (
        <Controller
          name={name as FieldPath<T>}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div className="flex flex-col items-start gap-1">
              {renderToggle(field.value, () => field.onChange(!field.value))}
              {error && <Error error={error} />}
            </div>
          )}
        />
      ) : (
        renderToggle(!!value, () => onChange?.(!value))
      )}
    </div>
  );
};

export default ToggleButton;
