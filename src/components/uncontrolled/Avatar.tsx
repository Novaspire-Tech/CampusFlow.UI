import React from "react";

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: number; // px
}

const getInitials = (first?: string, last?: string) => {
  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }
  if (first) {
    return first.slice(0, 2).toUpperCase();
  }
  return "??";
};

const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  
}) => {
  const initials = getInitials(firstName, lastName);

  return (
    <div
      className="flex items-center justify-center rounded-full  text-slate-700 font-semibold select-none"
      
    >
      {initials}
    </div>
  );
};

export default Avatar;
