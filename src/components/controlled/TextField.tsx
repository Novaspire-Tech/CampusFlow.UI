import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { Text_Field } from '../../constants/RegexPattern';
import Label from '../Label';
import Error from './Error';

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  label?: string;
  control: Control<any>;
  required?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  rules?: {
    required?: string;
    pattern?: RegExp;
  };
  onChange?: (value: string) => void;
  disabled?: boolean; 
}

const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  control,
  labelClassName = "",
  inputClassName = "",
  required = false,
  onChange,
  disabled = false, 
  ...rest
}) => {
  const validationRules = {
    ...(required && { required: `${label} is required` }),
    pattern: {
      value: Text_Field,
      message: `${label} can contain letters, numbers, and basic punctuation`,
    },
  };

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: validationRules,
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return;     
    field.onChange(e);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="mb-2">
      {label && (
        <Label
          label={label}
          required={required}
          labelClassName={labelClassName}
        />
      )}

      <input
        {...field}
        {...rest}
        id={name}
        disabled={disabled}   
        onChange={handleChange}
        aria-invalid={!!error}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}
        ${inputClassName}`}
      />

      {error && <Error error={error} />}
    </div>
  );
};

export default TextField;

 
