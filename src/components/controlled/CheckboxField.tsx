import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import Label from '../Label';
import Error from './Error';

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  control: Control<any>;
  required?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  control,
  required = false,
  ...rest
}) => {
  return (
    <div className="mb-2">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field, fieldState }) => (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={name}
                {...field}
                {...rest}
                checked={!!field.value}
                className={`form-checkbox h-4 w-4 text-indigo-600 ${
                  fieldState.error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {label && <Label label={label} required={required} />}
            </div>
                {fieldState.error && (
             <Error error={fieldState.error}/>
            )}
            
          </>
        )}
      />
    </div>
  );
};

export default CheckboxField;
