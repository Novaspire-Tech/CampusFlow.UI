import React, {type InputHTMLAttributes } from 'react';
import { Controller,type Control } from 'react-hook-form';
import { FiLink } from 'react-icons/fi';
import { URL_REGEX } from '../../constants/RegexPattern'; 
import Error from './Error';
import Label from '../Label';
interface URLInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  control: Control<any>;
  label?: string;
  required?: boolean;
}

const URLInput: React.FC<URLInputProps> = ({
  name,
  control,
  label = 'URL',
  required = false,
  placeholder = 'https://example.com',
  ...rest
}) => {
  return (
    <div className="mb-4">
          {label && (
        <Label label={label} required={required} labelClassName="mb-1" />
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          pattern: {
            value: URL_REGEX,
            message: 'Enter a valid URL',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiLink className="text-gray-400" />
              </div>
              <input
                {...field}
                {...rest}
                id={name}
                type="url"
                placeholder={placeholder}
                className={`block w-full pl-10 py-2 border rounded-md focus:outline-none ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          {error && (
             <Error error={error}/>
            )}
          </>
        )}
      />
    </div>
  );
};

export default URLInput;
