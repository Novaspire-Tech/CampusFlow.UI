import React from 'react'
import { useController, type Control } from 'react-hook-form'
import Label from '../Label'
import Error from './Error'

interface UniversalTextFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  name: string
  label?: string
  control: Control<any>
  required?: boolean
  labelClassName?: string
  inputClassName?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

const UniversalTextField: React.FC<UniversalTextFieldProps> = ({
  name,
  label,
  control,
  required = false,
  labelClassName = '',
  inputClassName = '',
  onChange,
  disabled = false,
  ...rest
}) => {
 const validationRules = {
  ...(required && {
    required: `${label} is required`,
  }),
    validate: (value: string) => {
      if (/[\u0000-\u001F\u007F]/.test(value)) {
        return 'Invalid characters are not allowed'
      }
      if (/^#+(\s+#+)*$/.test(value.trim())) {
        return 'Please enter a valid tag line'
      }
      return true
    },
  }

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: validationRules,
  })

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (disabled) return

    field.onChange(e)

    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="mb-2">
      {label && <Label label={label} required={required} labelClassName={labelClassName} />}

      <input
        {...field}
        {...rest}
        id={name}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={!!error}
        className={`mt-1 block w-full px-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''
        } ${inputClassName}`}
      />

      {error && <Error error={error} />}
    </div>
  )
}

export default UniversalTextField
