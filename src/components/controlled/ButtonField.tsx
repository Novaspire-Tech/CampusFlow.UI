import React from "react";

interface ButtonProps {
  name: string;
  loading: boolean;
  clr?: string;
  isDisable?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const ButtonField: React.FC<ButtonProps> = ({
  name,
  loading,
  clr,
  isDisable = false,
  onClick,
  icon,
  type = "button",
}) => {

  const baseClasses = `
    w-auto flex justify-center items-center gap-2
    font-semibold shadow-md transition duration-300
    px-4 py-2 rounded-md
  `;

  const disabledClasses = isDisable 
    ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-70" 
    : clr 
      ? "text-white cursor-pointer hover:opacity-90" 
      : "bg-slate-700 text-white cursor-pointer hover:bg-slate-900";

  return (
    <button
      type={type}
      disabled={isDisable}
      onClick={onClick}
      style={clr && !isDisable ? { backgroundColor: clr } : {}}
      className={`${baseClasses} ${disabledClasses}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {name}
        </>
      )}
    </button>
  );
};

export default ButtonField;