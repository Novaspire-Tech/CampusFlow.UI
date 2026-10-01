import React, { useState, useRef, useEffect } from "react";
import { Controller, type Control } from "react-hook-form";
import Error from "./Error";
import Label from "../Label";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";

type Option = string | { label: string; value: string | number };

interface SearchDropdownProps {
  name: string;
  control: Control<any>;
  required?: boolean;
  options?: Option[];
  label: string;
  allowCustomInput?: boolean;
  placeholder?: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  name,
  label,
  control,
  required = false,
  options = [],
  allowCustomInput = false,
  placeholder = "",
}) => {
  const { t } = useTranslation();
  const SelectText = getPagesDataText(t);
  const This_field_is_required_Text = getPagesDataText(t);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full mx-auto mb-2" ref={dropdownRef}>
      <Label label={label} required={required} />
      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                required:
                  This_field_is_required_Text.This_field_is_required ||
                  "This field is required",
              }
            : {}
        }
        render={({ field, fieldState: { error } }) => {
          const getDisplayValue = () => {
            if (!field.value) return "";

            const option = options.find((opt) => {
              const optValue = typeof opt === "object" ? opt.value : opt;
              return optValue === field.value;
            });

            if (option) {
              return typeof option === "object" ? option.label : option;
            }

            return field.value;
          };

          const filteredOptions = options.filter((opt) => {
            const label = typeof opt === "object" ? opt.label : opt;
            return label
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          });

          const exactMatch = filteredOptions.some((opt) => {
            const label = typeof opt === "object" ? opt.label : opt;
            return label.toLowerCase() === searchTerm.toLowerCase();
          });

          return (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={isOpen ? searchTerm : getDisplayValue()}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={() => {
                    setIsOpen(true);
                    setSearchTerm("");
                  }}
                  placeholder={placeholder || SelectText.Select || "Select..."}
                  className={`mt-1 w-full p-2 pr-10 border rounded-md shadow ${
                    error ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                  autoComplete="off"
                />

                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-2 mt-1 cursor-pointer"
                  onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                      setSearchTerm("");
                    }
                  }}
                >
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {isOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                      <>
                        {filteredOptions.map((opt, idx) => {
                          const value =
                            typeof opt === "object" ? opt.value : opt;
                          const label =
                            typeof opt === "object" ? opt.label : opt;
                          const isSelected = field.value === value;

                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                field.onChange(value);
                                setIsOpen(false);
                                setSearchTerm("");
                              }}
                              className={`p-2 cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-blue-100"
                              }`}
                            >
                              {label}
                            </div>
                          );
                        })}
                        {allowCustomInput && searchTerm && !exactMatch && (
                          <div
                            onClick={() => {
                              field.onChange(searchTerm);
                              setIsOpen(false);
                              setSearchTerm("");
                            }}
                            className="p-2 hover:bg-green-100 cursor-pointer text-green-600 border-t border-gray-200 font-medium"
                          >
                            + Add "{searchTerm}"
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {searchTerm ? (
                          allowCustomInput ? (
                            <div
                              onClick={() => {
                                field.onChange(searchTerm);
                                setIsOpen(false);
                                setSearchTerm("");
                              }}
                              className="p-2 hover:bg-green-100 cursor-pointer text-green-600 font-medium"
                            >
                              + Add "{searchTerm}"
                            </div>
                          ) : (
                            <div className="p-2 text-gray-500 text-center">
                              No options found
                            </div>
                          )
                        ) : (
                          <div className="p-2 text-gray-500 text-center">
                            Type to search...
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <Error error={error} />
            </>
          );
        }}
      />
    </div>
  );
};

export default SearchDropdown;
 