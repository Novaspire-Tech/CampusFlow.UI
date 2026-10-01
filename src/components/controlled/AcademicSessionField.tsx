import React from 'react';
import { useController, type Control } from 'react-hook-form';
import Label from '../Label';
import Error from './Error';
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";
 
interface AcademicSessionFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  control: Control<any>;
  startYear?: number;
  numberOfYears?: number;
}
 
const AcademicSessionField: React.FC<AcademicSessionFieldProps> = ({
  name,
  label,
  control,
  startYear = 2020,
  numberOfYears = 10,
  ...rest
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: 'Academic session is required',
    },
  });
 
  const generateOptions = (): string[] => {
    const options: string[] = [];
    for (let i = 0; i < numberOfYears; i++) {
      const fromYear = startYear + i;
      const toYear = fromYear + 1;
      options.push(`${fromYear}-${toYear}`);
    }
    return options;
  };
 
  const required = true;
 
  const {t} = useTranslation();
  const SelectAcademicText = getPagesDataText(t);
 
  return (
    <div className="mb-2">
         {label && (
        <Label label={label} required={required} labelClassName="mb-1" />
      )}
      <select
        {...field}
        {...rest}
        id={name}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm`}
      >
        <option value="">{SelectAcademicText.Select_Academic_Session}</option>
        {generateOptions().map((session) => (
          <option key={session} value={session}>
            {session}
          </option>
        ))}
      </select>
      {error && (
             <Error error={error}/>
            )}
    </div>
  );
};
 
export default AcademicSessionField;
 
 