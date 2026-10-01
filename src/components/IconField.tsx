import React from "react";
import * as FaIcons from "react-icons/fa";

interface IconFieldProps {
  name: string;           
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const IconField: React.FC<IconFieldProps> = ({
  name,
  size = 20,
  color = "inherit",
  className = "",
  onClick,
}) => {
  const DynamicIcon = FaIcons[name as keyof typeof FaIcons]; 

  if (!DynamicIcon) {
    console.warn(` Icon "${name}" not found in react-icons/fa`);
    return null; 
  }

  return (
    <DynamicIcon
      size={size}
      color={color}
      className={className}
      onClick={onClick}
    />
  );
};

export default IconField;
