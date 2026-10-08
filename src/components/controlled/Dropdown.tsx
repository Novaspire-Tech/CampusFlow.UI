import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import Error from "./Error";
import Label from "../Label";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";
 
type Option = string | { label: string; value: string | number };
 
interface DropdownProps<T extends FieldValues> {
  name: string;
  control: Control<T>;
  required?: boolean;
  options?: Option[];
  label : string;
  selected?: string | number;
  onChange?: (value: string | number) => void;
  Options?: string;
 disabled?: boolean;
 
}
 
const Dropdown = <T extends FieldValues>({
  name,
  label,
  control,
  required = false,
  disabled = false, 
  options = [],
}: DropdownProps<T>) => {
 
const {t} = useTranslation();
const SelectText= getPagesDataText(t);
const This_field_is_required_Text= getPagesDataText(t);
 
  return (
   <div className="w-full mx-auto mb-2">
  <Label label={label} required={required} />
  <Controller
    name={name as FieldPath<T>}
    control={control}
    rules={required ? { required: This_field_is_required_Text.This_field_is_required } : {}}
    render={({ field, fieldState: { error } }) => (
      <>
        <select
          {...field}
          id={name}
          disabled={disabled}
          className={`mt-1 w-full p-2 border rounded-md shadow ${
            error ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
        >
          <option value="">{SelectText.Select}</option>
          {options.map((opt, idx) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const label = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={idx} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        <Error error={error} />
      </>
    )}
  />
</div>
 
  );
};
 
export default Dropdown;
 