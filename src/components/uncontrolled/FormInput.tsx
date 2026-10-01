import React, { useState, useEffect } from "react";
import Label from "../Label";
import { Error } from "../controlled";
 
interface FormInputProps {
  addCategory: (categoryData: { category: string; description?: string }) => void;
  initialData: { id: number | string; category: string; description?: string } | null;
  onCancel: () => void;
  saveButtonText: string;
  hasDescription?: boolean;
  nameLabel?: string;
  required?: boolean;
  descriptionLabel?: string;
  customClassName?: string;
}
 
const FormInput: React.FC<FormInputProps> = ({
  addCategory,
  initialData,
  onCancel,
  saveButtonText,
  hasDescription = false,
  required = false,
  nameLabel = "Category",
  descriptionLabel = "Description",
  customClassName = "",
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryError, setCategoryError] = useState("");
 
  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.category || "");
      setDescription(initialData.description || "");
      setCategoryError("");
    } else {
      setCategoryName("");
      setDescription("");
      setCategoryError("");
    }
  }, [initialData]);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCategory = categoryName.trim();
 
    if (!trimmedCategory) {
      setCategoryError(`${nameLabel} is required.`);
      return;
    }
 
    setCategoryError("");
    addCategory({ category: trimmedCategory, description: description.trim() });
 
    if (!initialData) {
      setCategoryName("");
      setDescription("");
    }
  };
 
  const handleCancelClick = () => {
    onCancel();
    setCategoryName("");
    setDescription("");
    setCategoryError("");
  };
 
  return (
    <form onSubmit={handleSubmit} className={customClassName}>
      <div className="mb-4">
        {/* <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
          {nameLabel}
        </label> */}
        {nameLabel &&
          <Label label={nameLabel} required={required}
          />}
        <input
          type="text"
          id="category"
          className={`shadow-xl border border-gray-200 rounded w-full py-2 px-3 text-gray-700 ${categoryError ? "border-red-500" : ""
            }`}
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
            if (categoryError) setCategoryError("");
          }}
          placeholder="Enter category name"
        />
        {/* {categoryError && <p className="text-red-500 text-xs italic mt-1">{categoryError}</p>} */}
        {categoryError &&
          <Error error={{ message: categoryError }} />
        }
 
      </div>
 
      {hasDescription && (
        <div className="mb-4">
          {/* <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            {descriptionLabel}
          </label> */}
          {descriptionLabel &&
          <Label label={descriptionLabel} required={required}
          />}
          <textarea
            id="description"
            className="shadow-xl border border-gray-200 rounded w-full py-2 px-3 text-gray-700"
            rows={3}
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
           {categoryError &&
          <Error error={{ message: categoryError }} />
        }
        </div>
      )}
 
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="bg-slate-600 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {saveButtonText}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={handleCancelClick}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
 
export default FormInput;
 