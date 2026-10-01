export const USER = /^[a-zA-Z0-9_]{3,20}$/;
export const PHONE_NUMBER = /^[0-9]{10}$/;
export const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const Office_Number = /^[0-9-]*$/;
export const Otp = /^[0-9]{6}$/;
export const NAME = /^[a-zA-Z0-9\s.,'-]{2,}$/
export const URL_REGEX = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
export const AMOUNT = /^\d+(\.\d{1,2})?$/;
export const NUMBER = /^[0-9]+$/;
export const IFSC_Code = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const Mobile_Field = /^[1-9][0-9]{9}$/;
export const Upload_Modal = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
export const Text_Field = /^[a-zA-Z0-9\s.,'"!_@?()\-]*$/;
export const TextArea_Field = /^[\s\S]+$/;
export const Time_Field =  /^(0?[1-9]|1[0-2]):[0-5][0-9](\s?(AM|PM))?(\s?-?\s?(0?[1-9]|1[0-2]):[0-5][0-9](\s?(AM|PM))?)?$/;
export const AADHAR = /^\d{4}\s?\d{4}\s?\d{4}$/;


// Password validation rules
export const PASSWORD_VALIDATORS = {
  minLength: (value: string) => value.length >= 8,
  maxLength: (value: string) => value.length <= 12,
  uppercase: (value: string) => /[A-Z]/.test(value),
  lowercase: (value: string) => /[a-z]/.test(value),
  number: (value: string) => /[0-9]/.test(value),
  specialChar: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
};
 
// Final password validation function
export const validatePassword = (password: string) => {
  const isMinLengthValid = PASSWORD_VALIDATORS.minLength(password);
  const isMaxLengthValid = PASSWORD_VALIDATORS.maxLength(password);
  const hasUppercase = PASSWORD_VALIDATORS.uppercase(password);
  const hasLowercase = PASSWORD_VALIDATORS.lowercase(password);
  const hasNumber = PASSWORD_VALIDATORS.number(password);
  const hasSpecialChar = PASSWORD_VALIDATORS.specialChar(password);
 
  const isValid =
    isMinLengthValid &&
    isMaxLengthValid &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar;
 
  return {
    isValid,
    checks: {
      minLength: isMinLengthValid,
      maxLength: isMaxLengthValid,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      specialChar: hasSpecialChar,
    },
  };
};
 
 
 
 