import React from "react";

type labelProps = { label: string; labelClassName?: string; required: boolean };

const Label: React.FC<labelProps> = ({ label, required, labelClassName }) => {
  return (
    <div>
      <label
        className={`${labelClassName}text-sm font-semibold flex gap-1 whitespace-nowrap`}
      >
        {label}
        {required && <p className="text-red-600">*</p>}
      </label>
    </div>
  );
};

export default Label;