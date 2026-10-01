import { useEffect } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { useSchoolsByGroup } from "../../hooks/queries/superAdmin/useSchool";


interface SchoolSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Auto-populate from localStorage when role is not SCHOOL_GROUP */
  autoFill?: boolean;
}

const ls = (key: string) => localStorage.getItem(key) ?? "";

/**
 * SchoolSelect
 *
 * Renders a school dropdown only for SCHOOL_GROUP role users.
 * For all other roles it silently registers the value from localStorage.
 *
 * Usage:
 *   <SchoolSelect control={control} name="schoolCode" required />
 */
function SchoolSelect<T extends FieldValues>({
  control,
  name,
  label = "School",
  required = false,
  disabled = false,
  placeholder = "Select School",
  autoFill = true,
}: SchoolSelectProps<T>) {
  const role = ls("role");
  const schoolGroupCode = ls("schoolGroupCode");
  const isSchoolGroup = role.toUpperCase() === "SCHOOL_GROUP";

  const { data: schoolsData, isLoading } = useSchoolsByGroup(
    isSchoolGroup ? schoolGroupCode : ""
  );
  const schools = schoolsData?.schools ?? [];

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: required ? { required: `${label} is required` } : {},
  });

  // For non-SCHOOL_GROUP roles, auto-fill from localStorage
  useEffect(() => {
    if (!isSchoolGroup && autoFill && !field.value) {
      const savedCode = ls("schoolCode");
      if (savedCode) field.onChange(savedCode);
    }
  }, [isSchoolGroup, autoFill]);

  // Hidden input for non-SCHOOL_GROUP — value is set silently
  if (!isSchoolGroup) return null;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* School icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5 8.29V13a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2A1 1 0 0015 13V8.29l2.394-1.37a1 1 0 000-1.84l-7-3zM13 11.382l-3 1.5-3-1.5V9.118l3 1.364 3-1.364v2.264zM10 9L4.236 6 10 3l5.764 3L10 9z" />
          </svg>
        </span>

        <select
          {...field}
          disabled={disabled || isLoading}
          className={`
            w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-white
            appearance-none cursor-pointer transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}
          `}
        >
          <option value="">
            {isLoading ? "Loading schools…" : placeholder}
          </option>
          {schools.map((school: any) => (
            <option key={school.schoolCode} value={school.schoolCode}>
              {school.schoolName}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}

export default SchoolSelect;