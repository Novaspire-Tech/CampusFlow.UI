import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import officeNoValidate from "../../common/officeNoValidate";
import Error from "./Error";
import Label from "../Label";

interface OfficeNumberProps<T extends FieldValues> {
  name: string;
  control: Control<T>;
  required?: boolean;
  label : string;
}

const OfficeNumber = <T extends FieldValues>({
  label,
  name,
  control,
  required = false,
  ...rest
}: OfficeNumberProps<T>) => {
  return (
    <div className="mb-2">
      <Label label={label} required={required}/>
      <Controller
        name={name as FieldPath<T>}
        control={control}
        rules={{ validate: officeNoValidate(required) }}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              {...rest}
              id={name}
              type="tel"
              inputMode="tel"
              className={`mt-1 block w-full px-4 py-2 shadow border rounded-md  ${
                error ? "border-red-500" : "border-gray-300  focus:ring-blue-500"
              }`}
            />
            <Error error={error} />
          </>
        )}
      />
    </div>
  );
};

export default OfficeNumber;
