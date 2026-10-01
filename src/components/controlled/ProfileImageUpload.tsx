import React, { useState, useRef } from "react";
import { type Control, Controller } from "react-hook-form";
import Icon from '../IconField';
// import { useTranslation } from "react-i18next";
// import { t } from "../../helpers/useTranslations";
// import { getCommonTexts } from "../../helpers";
 
interface ProfileImageUploadProps {
  name: string;
  control: Control<any>;
  label?: string;
  error?: string;
  maxSize?: number; // in MB
  defaultImage?: string;
  disabled?: boolean;
  className?: string;
}
 
export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  name,
  control,
  label,
  error,
  maxSize = 4,
  defaultImage,
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
 
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file";
    }
 
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size should be less than ${maxSize}MB`;
    }
 
    return null;
  };
 
//   const { t } = useTranslation();
//   const buttonTexts = getPhoto(t);
//   const commonTexts = getCommonTexts(t);
 
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
 
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
 
  const handleDrop = async (
    e: React.DragEvent,
    onChange: (value: string) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
 
    if (disabled) return;
 
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const validationError = validateFile(file);
 
      if (validationError) {
        console.error(validationError);
        return;
      }
 
      try {
        const base64 = await convertToBase64(file);
        onChange(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };
 
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const validationError = validateFile(file);
 
      if (validationError) {
        console.error(validationError);
 
        alert(validationError);
        return;
      }
 
      try {
        const base64 = await convertToBase64(file);
        onChange(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert("Error uploading file. Please try again.");
      }
    }
  };
 
  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
 
  const handleRemoveImage = (onChange: (value: string) => void) => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
 
  return (
    <div className={`space-y-2 ${className}`}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div
            className={`p-3  sm:p-6 relative transition-colors ${dragActive
                ? "bg-sky-50 border-2 border-sky-300 border-dashed"
                : ""
              }`}
          >
            <div className=" gap-3 sm:gap-6">
              
              <div className="relative flex-shrink-0">
                <div className="ml-5 w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center shadow-sm">
                  {value || defaultImage ? (
                    <img
                      src={value || defaultImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "";
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Icon
                      name="User"
                      size={20}
                      className="sm:text-2xl lg:text-3xl text-gray-400"
                    />
                  )}
                </div>
              </div>
 
              <div className="flex-1 min-w-0 mt-2">
                <h3 className="text-sm ml-5 sm:text-base lg:text-lg font-medium text-gray-900 mb-1">
                  {label}
                </h3>
                {/* <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  {"image rules"} {maxSize} mb
                </p> */}
 
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => triggerFileSelect()}
                    disabled={disabled}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {"Upload"}
                  </button>
 
                  {(value || defaultImage) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(onChange)}
                      disabled={disabled}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {"cancel"}
                    </button>
                  )}
                </div>
              </div>
 
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, onChange)}
                className="hidden"
                disabled={disabled}
              />
            </div>
 
            <div
              className={`absolute inset-0 rounded-lg transition-opacity ${dragActive
                  ? "opacity-100 pointer-events-auto bg-sky-50/80 flex items-center justify-center"
                  : "opacity-0 pointer-events-none"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, onChange)}
            >
              {dragActive && (
                <div className="text-sky-600 font-medium text-sm sm:text-base">
                  Drop image here
                </div>
              )}
            </div>
          </div>
        )}
      />
 
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};