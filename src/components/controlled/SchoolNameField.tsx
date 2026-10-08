import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import nameValidate from "../../common/nameValidate";
 
interface SchoolNameFieldProps<T extends FieldValues> {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  control: Control<T>;
  pattern?: RegExp;
  patternMessage?: string;
  labelClassName?: string;
  inputClassName?: string;
}
 
const SchoolNameField = <T extends FieldValues>({
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
}: SchoolNameFieldProps<T>) => {
  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} labelClassName={labelClassName} />}
      <Controller
        name={name as FieldPath<T>}
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