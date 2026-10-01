import { Controller, type Control, type FieldValues } from "react-hook-form";
import Label from "../Label";
import Error from "./Error";
import type { Path } from "react-hook-form";
import { useRef, useEffect, useState } from "react";
import { openDocument } from "../../hooks/useBlobImage";
 
interface FileUploadFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  required?: boolean;
  accept?: string;
  existingFileUrl?: string | null;
  maxSizeInMB?: number;
}
 
const FileUploadField = <T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  required = false,
  accept,
  existingFileUrl,
  maxSizeInMB = 2,
}: FileUploadFieldProps<T>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
 
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
 
  return (
    <div>
      {label && (
        <Label label={label} required={required} labelClassName="mb-1" />
      )}
 
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is mandatory." } : {}}
        render={({ field: { onChange, value, ref, ...field }, fieldState: { error } }) => {
          useEffect(() => {
            if (!value && fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }, [value]);
 
          return (
            <>
              {existingFileUrl && (
                <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-600">Current file: </span>
                  <button 
                   type="button"
                    className="text-blue-600 hover:text-blue-800 underline text-sm pointer-events-auto cu"
                     onClick={() => {
                                            if (existingFileUrl ) {
                                              openDocument(existingFileUrl );
                                            }
                                          }}
                  >
                    view existing document
                  </button>
                </div>
              )}
 
              <input
                {...field}
                type="file"
                ref={(e) => {
                  ref(e);
                  if (fileInputRef.current !== e) {
                    fileInputRef.current = e;
                  }
                }}
                accept={accept}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] || null;
 
                  if (file) {
                    if (file.size > maxSizeInBytes) {
                      setFileSizeError(`File cannot be more than ${maxSizeInMB}MB`);
                      onChange(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      return;
                    }
                    setFileSizeError(null);
                    onChange(file);
                  } else {
                    setFileSizeError(null);
                    if (!value && existingFileUrl) {
                      onChange("__KEEP_EXISTING__");
                    } else {
                      onChange(value);
                    }
                  }
                }}
                className={`w-full border rounded px-3 py-2 ${
                  (error && required) || fileSizeError ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              />
 
              {existingFileUrl && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep existing file, or select a new file to replace it
                </p>
              )}
 
              {fileSizeError && (
                <p className="text-xs text-red-500 mt-1">{fileSizeError}</p>
              )}
 
              {error && !fileSizeError && <Error error={error} />}
            </>
          );
        }}
      />
    </div>
  );
};
 
export default FileUploadField;