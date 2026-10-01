import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, TextareaField, TextField } from "../../../components/controlled";
import Dropdown from "../../../components/controlled/Dropdown";
import DateField from "../../../components/controlled/DateField";
import FileUploadField from "../../../components/controlled/FileUploadField";
import EmailField from "../../../components/controlled/EmailField";
import MobileField from "../../../components/controlled/MobileField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import {
  useSchools,
  useSchool,
  useFilterSchools,
  useRegisterSchool,
  useUpdateSchool,
} from "../../../hooks/queries/superAdmin/useSchool";
import type {
  School,
  SchoolCompleteRegistrationRequest,
  UpdateSchoolRequestDto,
  SchoolForm,
  SchoolLogoProps,
  ViewModalProps,
  FilterSchoolRequest,
  SchoolFilterState,
  FilterBarProps,
} from "../../../types/superAdmin/School";
import { toast } from "react-toastify";
import { useStaffPhoto } from "../../../hooks/queries/humanResource/useStaffPhoto";
import { usePackages } from "../../../hooks/queries/superAdmin/usePackage";
import BirthDateField from "../../../components/controlled/BirthDateField";


const DEFAULT_FILTERS: SchoolFilterState = {
  startDate: "",
  endDate: "",
  packageCategories: "",
  isActive: "",
  search: "",
};

const defaultFormValues: SchoolForm = {
  packageId: "",
  schoolName: "",
  schoolCode: "",
  email: "",
  phoneNumber: "",
  address: "",
  session: "",
  logo: null,
  databaseName: "",
  defaultConnectionString: "yes",
  dbAddress: "",
  password: "",
  username: "",
  databaseType: "",
  type: "",
  managedBy: "",
  webSite: ""
};



const toBackendDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
};

/** Format ISO date string → "19 Feb 2026" */
const formatDate = (iso: string | undefined): string => {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};


const SchoolLogo: React.FC<SchoolLogoProps> = ({ logoPath, schoolName }) => {
  const { photoUrl, loading: photoLoading } = useStaffPhoto(logoPath ?? undefined);

  if (photoLoading) {
    return (
      <div className="h-16 w-16 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
        <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${schoolName} logo`}
        className="h-16 w-16 rounded-full object-cover border border-gray-200 shrink-0"
      />
    );
  }

  return (
    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
      {schoolName?.charAt(0)?.toUpperCase() ?? "S"}
    </div>
  );
};


const ViewModal: React.FC<ViewModalProps> = ({ schoolCode, onClose }) => {
const { data: school, isLoading, isError } = useSchool(schoolCode, "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="px-8 pt-6 pb-5 shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">School Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isError && (
            <p className="text-red-500 text-center py-10">
              Failed to load school details. Please try again.
            </p>
          )}

          {school && !isLoading && (
            <div className="space-y-6">

              {/* ── Logo + Name ── */}
              <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                <SchoolLogo logoPath={school.logo} schoolName={school.schoolName} />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{school.schoolName || "N/A"}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{school.schoolCode || "—"}</p>
                  <span
                    className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${school.isActive
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-red-50 text-red-500 border border-red-200"
                      }`}
                  >
                    {school.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* ── Subscription / Plan Info ── */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3">
                  Subscription Info
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Plan Name</p>
                    <p className="text-sm font-medium text-gray-800">{school.planName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Billing Period</p>
                    <p className="text-sm font-medium text-gray-800">{school.billingPeriod || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Created Date</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(school.createdDate)}</p>
                  </div>
                </div>
              </div>

              {/* ── General Details Grid ── */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                {/* Email */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-gray-800">{school.email || "N/A"}</p>
                </div>

                {/* Phone Number */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone Number</p>
                  <p className="text-sm text-gray-800">{school.phoneNumber || "N/A"}</p>
                </div>

                {/* Session */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Session</p>
                  <p className="text-sm text-gray-800">{school.session || "N/A"}</p>
                </div>

                {/* Session Start Month */}
               

                {/* Database Name */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Database Name</p>
                  <p className="text-sm text-gray-800">{school.databaseName || "N/A"}</p>
                </div>

                {/* DB Type */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">DB Type</p>
                  <p className="text-sm text-gray-800">{school.databaseType || "N/A"}</p>
                </div>

                {/* DB Address */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">DB Address</p>
                  <p className="text-sm text-gray-800">{school.dbAddress || "N/A"}</p>
                </div>

                {/* Username */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Username</p>
                  <p className="text-sm text-gray-800">{school.username || "N/A"}</p>
                </div>

                {/* Default Connection */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Default Connection</p>
                  <span
                    className={`inline-block text-xs px-3 py-1 rounded-full font-medium `}
                  >
                    {school.defaultConnectionString ? "Yes" : "No"}
                  </span>
                </div>

                {/* Address — full width */}
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-sm text-gray-800">{school.address || "N/A"}</p>
                </div>

                {/* Tenant ID — full width */}
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tenant ID</p>
                  <p className="text-sm text-gray-800 break-all">{school.tenantId || "N/A"}</p>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-8 pb-6 pt-4 shrink-0 border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const FilterBar: React.FC<FilterBarProps> = ({ control, packageOptions }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
    <div className="px-5 pt-2 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4">

        <div>
          <TextField
            name="search"
            label="Search"
            control={control}
            placeholder="Search schools…"
          />
        </div>

        <div>
          <Dropdown
            name="packageCategories"
            label="School Groups "
            control={control}
            options={[

              ...packageOptions,
            ]}
          />
        </div>

        <div>
          <Dropdown
            name="isActive"
            label="Status"
            control={control}
            options={[

              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
          />
        </div>

        <div>
          <BirthDateField
            name="startDate"
            label="Start Date"
            control={control}
          />
        </div>

        <div>
          <DateField
            name="endDate"
            label="End Date"
            control={control}
          />
        </div>

      </div>
    </div>
  </div>
);



const SchoolRegistration: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [viewingSchoolCode, setViewingSchoolCode] = useState<string | null>(null);
  const [, setPage] = useState(0);

  // ── Filter form ───────────────────────────────────────────────────────────
  const {
    control: filterControl,
    watch: filterWatch,
    reset: filterReset,
  } = useForm<SchoolFilterState>({ defaultValues: DEFAULT_FILTERS });

  const filterValues = filterWatch();

  const activeFilterCount = useMemo(
    () => Object.values(filterValues).filter(Boolean).length,
    [filterValues]
  );

  const handleFilterReset = useCallback(() => {
    filterReset(DEFAULT_FILTERS);
    setPage(0);
  }, [filterReset]);

  // ── Build backend DTO ─────────────────────────────────────────────────────
  const backendFilters = useMemo<FilterSchoolRequest>(() => {
    const dto: FilterSchoolRequest = {};
    if (filterValues.search?.trim()) dto.search = filterValues.search.trim();
    if (filterValues.packageCategories) dto.packageCategories = filterValues.packageCategories;
    if (filterValues.startDate) dto.startDate = toBackendDate(filterValues.startDate);
    if (filterValues.endDate) dto.endDate = toBackendDate(filterValues.endDate);
    if (filterValues.isActive !== "") dto.isActive = filterValues.isActive === "true";
    return dto;
  }, [filterValues]);

  // Reset to page 0 on filter change
  const prevFiltersRef = React.useRef(backendFilters);
  React.useEffect(() => {
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(backendFilters)) {
      setPage(0);
      prevFiltersRef.current = backendFilters;
    }
  }, [backendFilters]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    data: schoolsData,
    isLoading: isFetching,
    isError,
    error,
  } = useFilterSchools(backendFilters,);

  const { data: allSchoolsData } = useSchools();

  const { mutateAsync: registerSchool, isPending: isCreating } = useRegisterSchool();
  const { mutateAsync: updateSchool, isPending: isUpdating } = useUpdateSchool();
  const { data: packagesData, isLoading: isPackagesLoading } = usePackages();

  const isLoading = isCreating || isUpdating;

  const packageFilterOptions = useMemo(
    () =>
      (packagesData?.packages ?? []).map((pkg) => ({
        label: pkg.name,
        value: String(pkg.packageId),
      })),
    [packagesData]
  );

  const tableRows = useMemo(
    () =>
      (schoolsData?.schools ?? [])
        .filter((s) => s != null && s.schoolCode != null)
        .map((s) => ({ ...s, id: s.schoolCode })),
    [schoolsData]
  );

  // ── Registration / edit form ──────────────────────────────────────────────
  const { handleSubmit, control, reset, setValue } = useForm<SchoolForm>({
    defaultValues: defaultFormValues,
  });


  const onSubmit = async (formData: SchoolForm) => {
    try {
      if (editingSchool) {
        const dto: UpdateSchoolRequestDto = {
          schoolName: formData.schoolName,
          address: formData.address,
          session: formData.session,
          email: "",
          phoneNumber: "",
          databaseName: "",
          type: "",
          managedBy: "",
          webSite: ""
        };
        await updateSchool({
          schoolCode: editingSchool.schoolCode, data: dto,
          schoolGroupCode: ""
        });
        toast.success("School updated successfully!");
      } else {
        const dto: SchoolCompleteRegistrationRequest = {
          packageId: Number(formData.packageId),
          schoolName: formData.schoolName,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          session: formData.session,
          logo: formData.logo instanceof File ? formData.logo : null,
          databaseName: formData.databaseName,
          defaultConnectionString: formData.defaultConnectionString === "yes",
          dbAddress: formData.dbAddress || "",
          username: formData.username || "",
          password: formData.password || "",
          databaseType: formData.databaseType || "",
          type: "",
          managedBy: "",
          webSite: ""
        };
        await registerSchool(dto);
        toast.success("School registered successfully!");
      }
      reset(defaultFormValues);
      setEditingSchool(null);
      setShowForm(false);
      scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to save school. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (id: string | number) => {
    const school = (allSchoolsData?.schools ?? []).find(
      (s) => s.schoolCode === String(id)
    );
    if (!school) { toast.error("School not found. Please try again."); return; }

    setEditingSchool(school);
    reset({
      packageId: String(school.packageId ?? ""),
      schoolName: school.schoolName ?? "",
      schoolCode: school.schoolCode ?? "",
      email: school.email ?? "",
      phoneNumber: school.phoneNumber ?? "",
      address: school.address ?? "",
      session: school.session ?? "",
      logo: null,
      databaseName: school.databaseName ?? "",
      defaultConnectionString: school.defaultConnectionString ? "yes" : "no",
      dbAddress: school.dbAddress ?? "",
      password: "",
      username: school.username ?? "",
      databaseType: school.databaseType ?? "",
    });

    setValue("defaultConnectionString", school.defaultConnectionString ? "yes" : "no", { shouldValidate: false, shouldDirty: true });
    setShowForm(true);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (id: string | number) => setViewingSchoolCode(String(id));

  const closeForm = () => {
    reset(defaultFormValues);
    setEditingSchool(null);
    setShowForm(false);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const columns = [
    { key: "schoolName", label: "School Name" },
    { key: "schoolCode", label: "School Code" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "session", label: "Session" },
  ];

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Failed to load schools</p>
          <p className="text-sm mt-1">{(error as any)?.message || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">

      {/* ── View Modal ── */}
      {viewingSchoolCode && (
        <ViewModal schoolCode={viewingSchoolCode} onClose={() => setViewingSchoolCode(null)} />
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8">

        {showForm ? (
          <div className="w-full mx-auto">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">
                  {editingSchool ? "Edit School" : "Create School"}
                </h1>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {!editingSchool && (
                        <Dropdown
                          name="packageId"
                          label="School Groups"
                          control={control}
                          required
                          options={
                            isPackagesLoading
                              ? [{ label: "Loading...", value: "" }]
                              : (packagesData?.packages ?? []).map((pkg) => ({
                                label: pkg.name,
                                value: String(pkg.packageId),
                              }))
                          }
                        />
                      )}

                      <TextField name="schoolName" placeholder="Enter school name" label="School Name" control={control} required />
                      <EmailField name="email" placeholder="Enter school email" label="Email" control={control} required disabled={!!editingSchool} />
                      <MobileField name="phoneNumber" placeholder="Enter phone number" label="Phone Number" control={control} required />

                      <div className="md:col-span-2">
                        <TextareaField name="address" placeholder="Enter full address" label="Address" control={control} rows={3} required />
                      </div>

                      <TextField name="session" placeholder="e.g., 2025-2026" label="Session" required control={control} />

                      <Dropdown
                        name="sessionStartMonth"
                        label="Session Start Month"
                        control={control}
                        required
                        options={[
                          { label: "January", value: "January" },
                          { label: "February", value: "February" },
                          { label: "March", value: "March" },
                          { label: "April", value: "April" },
                          { label: "May", value: "May" },
                          { label: "June", value: "June" },
                          { label: "July", value: "July" },
                          { label: "August", value: "August" },
                          { label: "September", value: "September" },
                          { label: "October", value: "October" },
                          { label: "November", value: "November" },
                          { label: "December", value: "December" },
                        ]}
                      />

                      <Dropdown
                        name="startDayOfWeek"
                        label="Session Start Day"
                        control={control}
                        required
                        options={[
                          { label: "Monday", value: "Monday" },
                          { label: "Tuesday", value: "Tuesday" },
                          { label: "Wednesday", value: "Wednesday" },
                          { label: "Thursday", value: "Thursday" },
                          { label: "Friday", value: "Friday" },
                          { label: "Saturday", value: "Saturday" },
                          { label: "Sunday", value: "Sunday" },
                        ]}
                      />

                      {!editingSchool && (
                        <div className="md:col-span-2">
                          <FileUploadField name="logo" label="School Logo" control={control} required />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Database Configuration ── */}
                  {/* <div className="space-y-6 pt-6 border-t border-gray-200">
   <h2 className="text-xl font-semibold text-gray-800">Database Configuration</h2>
   <div className="space-y-6">
     <div className="grid grid-cols-1 gap-6">
<TextField
  name="databaseName"
  placeholder="Enter database name"
  label="Database Name"
  control={control}
  required
  disabled={!!editingSchool}
/>
<RadioButton
  name="defaultConnectionString"
  label="Default Connection"
  control={control}
  required
  options={[
    { label: "Yes", value: "yes" },
    { label: "No",  value: "no"  },
  ]}
/>
     </div>

     {defaultConnectionString === "no" && (
<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
  <h3 className="text-lg font-semibold text-gray-800">Custom Database Connection</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <TextField name="dbAddress"  placeholder="192.168.1.1"   label="DB IP Address" control={control} required />
    <TextField name="username"   placeholder="Enter username" label="Username"      control={control} required />
    <TextField name="password"   placeholder="Enter password" label="Password"      control={control} required />
    <Dropdown
name="databaseType"
label="Database Type"
control={control}
required
options={[
  { label: "MySQL",      value: "mysql"     },
  { label: "SQL Server", value: "sqlserver" },
  { label: "Oracle",     value: "oracle"    },
]}
    />
  </div>
</div>
     )}
   </div>
 </div>*/}

                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button name="Cancel" loading={false} isDisable={isLoading} onClick={closeForm} />
                    <Button
                      name={editingSchool ? "Update" : "Save"}
                      loading={isLoading}
                      isDisable={isLoading}
                      onClick={handleSubmit(onSubmit)}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

        ) : (
          <>
            <FilterBar
              control={filterControl}
              packageOptions={packageFilterOptions}
              onReset={handleFilterReset}
              activeCount={activeFilterCount}
            />

            <ControlledTable
              title="School"
              columns={columns}
              data={tableRows}
              fullData={tableRows}
              onEdit={handleEdit}
              onView={handleView}
              btn={true}
              btnName="Add School"
              showForm={setShowForm}
              showExport={false}
              showSearch={false}
              actionColumn={true}
              showSelectAll={false}
              showPaginationFooter={true}
              emptyMessage={
                isFetching
                  ? "Loading schools..."
                  : activeFilterCount > 0
                    ? "No schools match the selected filters"
                    : "No schools available"
              }
              exportFilename="schools_list"
              exportTitle="Schools Report"

            />
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolRegistration;