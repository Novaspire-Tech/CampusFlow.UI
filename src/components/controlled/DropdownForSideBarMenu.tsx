import React from "react";
import IconField from "../IconField";

interface MenuSectionProps {
  title: string;
  items: string[];
  isOpen: boolean;
  onToggle: () => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  items,
  isOpen,
  onToggle,
}) => {
  return (
    <div>
      <div
        onClick={onToggle}
        className="bg-gray-100 shadow p-2 mt-2 font-semibold cursor-pointer rounded hover:text-blue-400 duration-350"
      >
        {title}
      </div>
      {isOpen && (
        <div className="mt-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="shadow p-2 mb-1 bg-white flex items-center gap-2 hover:bg-gray-200 duration-300"
            >
             <IconField name="FaArrowsAlt" size={16} className="text-black cursor-move" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuSection;
