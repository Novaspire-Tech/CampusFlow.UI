import { Office_Number } from "../constants";

const officeNoValidate = (required: boolean) => (value: string) => {
    if(required){
    if (!value || value.trim() === "") {
      return `Office Number is required `;
    }
    if (!Office_Number.test(value)) {
      return `Office Number can contain only digits and hyphens`;
    }
    const digitCount = value.replace(/-/g, "").length;
    if (digitCount < 10) {
      return `Office Number must have at least 10 digits`;
    }
    if (digitCount > 15) {
      return `Office Number must have at most 15 digits`;
    }

    return true;
  }
  };

export default officeNoValidate;  