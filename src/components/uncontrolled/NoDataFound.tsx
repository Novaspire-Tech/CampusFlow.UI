import React from "react";
import { GoArrowLeft } from "react-icons/go";
import IconField from "../IconField";

const NoDataFound: React.FC = () => {
  return (
    <div className="text-[#181717] mt-5 flex flex-col font-semibold text-lg sm:text-xl">
      <p className="text-center text-[15px] font-semibold mb-10 text-[#FC6969]">
        No Data Available in Table
      </p>

      {/* Trash Icon */}
      <IconField
        name="FaTrash"
        size={104}
        color="#635F5F"
        className="self-center mt-10 w-[111px] z-10"
      />

      {/* File Icon */}
      <IconField
        name="FaFile"
        size={65}
        color="#787474"
        className="self-center relative bottom-[130px] w-[54px]"
      />

      <p className="text-center text-[15px] font-semibold mb-10 text-[#3D8208] flex items-center justify-center gap-1">
        <GoArrowLeft /> add new record or search with different criteria
      </p>
    </div>
  );
};

export default NoDataFound;
