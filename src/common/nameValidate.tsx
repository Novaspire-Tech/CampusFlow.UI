import { NAME } from "../constants/RegexPattern";

const nameValidate = ({
  required,
  label,
  pattern,
  patternMessage,
}: {
  required: boolean;
  label: string;
  pattern?: RegExp;
  patternMessage?: string;
}) => ({
  ...(required ? { required: `${label} is required` } : {}),
  pattern: {
    value: pattern || NAME,
    message: patternMessage || `${label} is invalid`,
  },
  minLength: {
    value: 2,
    message: `${label} must be at least 2 characters`,
  },
  maxLength: {
    value: 30,
    message: `${label} must be at most 50 characters`,
  },
});

export default nameValidate;