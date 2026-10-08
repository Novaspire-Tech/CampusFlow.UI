import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import nameValidate from "../../common/nameValidate";
interface NameFieldProps<T extends FieldValues> {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  control: Control<T>;
  pattern?: RegExp;
  patternMessage?: string;
  disabled?: boolean;
}

const NameField = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  pattern,
  patternMessage,
  required = false,
  disabled = false, 
  ...rest
}: NameFieldProps<T>) => {

  return (
    <div className="mb-2">
      {label && (
        <Label label={label} required={required} labelClassName="mb-1" />
      )}
      <Controller
        name={name as FieldPath<T>}
        control={control}
        rules={nameValidate({
          required,
          label: label || "Label",
          pattern,
          patternMessage,
        })}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              placeholder={placeholder}
              id={name}
              disabled={disabled} 
              className={`mt-1 block w-full px-4 py-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`} 
            />
            <Error error={error} />
          </>
        )}
      />
    </div>
  );
};

export default NameField;
