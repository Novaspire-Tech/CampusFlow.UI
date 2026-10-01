import React from 'react';
import { useController, type Control } from 'react-hook-form';
import Label from '../Label';
import Error from './Error';
import { NUMBER } from '../../constants/RegexPattern';


interface GridColumnFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  control: Control<any>; 
}

const GridColumnField: React.FC<GridColumnFieldProps> = ({
  name,
  label,
  control,
  ...rest
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: `${label} is required`,
      min: {
        value: 1,
        message: 'Minimum is 1',
      },
      max: {
        value: 12,
        message: 'Maximum is 12',
      },
      pattern: {
        value: NUMBER,
        message: 'Only numeric values allowed',
      },
    },
  });

  return (
    <div className="mb-2">
         {label && 
      <Label label={label} required={true}
       />}

      <div className="flex items-stretch mt-1 rounded-md shadow-sm max-w-xs border border-gray-300 overflow-hidden">
        <span className="inline-flex items-center px-3 bg-gray-50 text-gray-400 text-sm border-r">
          col-md-
        </span>
        <input
          {...field}
          {...rest}
          id={name}
          type="number"
          min={1}
          max={12}
          className="flex-1 px-3 py-2 focus:outline-none"
        />
      </div>
       {error && 
            <Error error={error} 
            />} 
    </div>
  );
};

export default GridColumnField;
