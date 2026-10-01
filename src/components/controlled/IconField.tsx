import React from "react";
import * as FaIcons from "react-icons/fa";
type IconName = keyof typeof FaIcons;
interface IconFieldProps {
    name: IconName;
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
    const DynamicIcon = FaIcons[name];
    if (!DynamicIcon) return null;
    return (
        <DynamicIcon size={size} color={color} className={className} onClick={onClick} />
    );
};
export default IconField;