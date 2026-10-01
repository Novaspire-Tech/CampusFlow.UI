import React, { useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Otp as OTP_REGEX } from '../../constants/RegexPattern';

interface OTPInputProps {
  length?: number;
  name: string;
  onChangeOTP: (otp: string, isValid?: boolean) => void;
}

const OtpField: React.FC<OTPInputProps> = ({ length = 6, name, onChangeOTP }) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { setValue, register } = useFormContext();

  useEffect(() => {
    register(name, {
      required: 'OTP is required',
      pattern: {
        value: OTP_REGEX,
        message: 'Enter a valid 6-digit OTP',
      },
    });
  }, [register, name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/, '');
    if (value.length > 1) return;

    if (inputRefs.current[index]) {
      inputRefs.current[index]!.value = value;
    }

    if (value !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = inputRefs.current.map(input => input?.value || '').join('');
    setValue(name, otp);
    const isValid = OTP_REGEX.test(otp);
    onChangeOTP(otp, isValid);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0 && !(e.target as HTMLInputElement).value) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          onChange={e => handleChange(e, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          className="
           lg:w-10 lg:h-10 max-sm:w-8 max-sm:h-8 md:w-6 md:h-6
           lg: text-lg max-sm::text-xl md:text-base
            text-center text-gray-300
            border border-gray-300
            rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            "
        />
      ))}
    </div>
  );
};

export default OtpField;
