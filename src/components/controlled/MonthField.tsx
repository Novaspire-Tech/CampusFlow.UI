import React from 'react';
import { useController, type Control } from 'react-hook-form';
import Error from './Error';
import Label from '../Label';

interface MonthFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  control: Control<any>; 
  required?: boolean;
}

const MonthField: React.FC<MonthFieldProps> = ({
  name,
  label = "Month",
  control,
  required = false,
  ...rest
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      ...(required && { required: `${label} is required` }),
    },
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="mb-2">
        {label && 
      <Label label={label} required={required}
       />}

      <select
        {...field}
        {...rest}
        id={name}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm`}
      >
        <option value="">Select Month</option>
        {months.map((month) => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>
        {error && 
            <Error error={error} 
            />}
    </div>
  );
};

export default MonthField;
