import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import logoValidate from "../../common/logoValidate";
import Error from "./Error";

interface LogoProps<T extends FieldValues> {
  name: string;
  control: Control<T>;
  required?: boolean;
}

const Logo = <T extends FieldValues>({
  name,
  control,
  required = false,
}: LogoProps<T>) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File, onChange: (...event: any[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
        onChange(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, onChange);
  };

  const handleDragDrop = (e: DragEvent<HTMLDivElement>, onChange: (...event: any[]) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, onChange);
  };

  return (
    <div className="flex flex-col gap-3 mb-2 mt-2">
      <Controller
        name={name as FieldPath<T>}
        control={control}
        rules={{ validate: logoValidate(required) }}
        render={({
          field: { onChange, ref: Ref, name },
          fieldState: { error },
        }) => (
          <>
            <div
              className="lg:w-30 md:w-30 w-27 lg:h-30 md:h-30 h-27 border-1 border-dashed rounded-lg flex items-center justify-center bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDragDrop(e, onChange)}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <span className="text-gray-500 text-sm text-center px-4">
                  Click or drag & drop image (max 2MB)
                </span>
              )}

              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  inputRef.current = el; 
                  Ref(el);
                }}
                onChange={(e) => handleChange(e, onChange)}
                className="hidden"
                name={name}
              />
            </div>

            {preview && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="lg:w-30 md:w-30 w-27 px-2 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                Change Image
              </button>
            )}
            <Error error={error} />
          </>
        )}
      />
    </div>
  );
};

export default Logo;
