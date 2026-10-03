import React, { useState, useCallback, useMemo, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import { useForm, useFieldArray } from "react-hook-form";
import { NumberField, TextareaField } from "../../../components/controlled";
import TextField    from "../../../components/controlled/TextField";
import AmountField  from "../../../components/controlled/AmountField";
import Dropdown     from "../../../components/controlled/Dropdown";
import DateField    from "../../../components/controlled/DateField";
import Button       from "../../../components/controlled/Button";
import { toast }   from "react-toastify";
import { ControlledTable } from "../../../components/uncontrolled";
import { confirmToast }   from "../../../helpers/confirmToast";
import {
  usePackagePage,
  useFilteredPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  usePackageDropdownOptions,
} from "../../../hooks/queries/superAdmin/usePackage";
import { packageService } from "../../../services/superAdmin/packageServices";
import type {
  CreatePackageRequestDTO,
  FilterPackageRequestDTO,
} from "../../../types/superAdmin/Package";
import BirthDateField from "../../../components/controlled/BirthDateField";


interface PackageFilterUI {
  billingPeriod: string;
  isActive:      string;
  startDate:     string;
  endDate:       string;
  search:        string;
}

interface PackageFormData {
  name:         string;
  description:  string;
  basePrice:    number;
  setupFee:     number;
  packageDays:  number;
  trialDays:    number;
  displayOrder: number;
  billingPeriod:string;
  features: {
    featureName:        string;
    description:        string;
    scope:              string;
    operations:         string[];
    limitType:          string;
    limitValue:         number;
    unit:               string;
    isEnabled:          boolean;
    displayOrder:       number;
  }[];
}

interface PackageRow {
  id:               number;
  packageId:        number;
  name:             string;
  billingPeriod:    string;
  basePrice:        number;
  packageDays:      number;
  trialDays:        number;
  totalSubscribers: number;
  isActive:         boolean;
  recommended:      boolean;
  [key: string]:    any;
}

const DEFAULT_FILTERS: PackageFilterUI = {
  billingPeriod: "",
  isActive:      "",
  startDate:     "",
  endDate:       "",
  search:        "",
};

const OPERATION_ICONS: Record<string, string> = {
  CREATE: "FaPlus",
  READ:   "FaEye",
  UPDATE: "FaEdit",
  DELETE: "FaTrash",
};

const OPERATION_COLORS: Record<string, { active: string; inactive: string }> = {
  CREATE: { active: "bg-green-500  text-white border-green-500",  inactive: "bg-white text-green-600  border-green-300  hover:bg-green-50"  },
  READ:   { active: "bg-blue-500   text-white border-blue-500",   inactive: "bg-white text-blue-600   border-blue-300   hover:bg-blue-50"   },
  UPDATE: { active: "bg-yellow-500 text-white border-yellow-500", inactive: "bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50" },
  DELETE: { active: "bg-red-500    text-white border-red-500",    inactive: "bg-white text-red-600    border-red-300    hover:bg-red-50"    },
};

const toBackendDate = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return "";
  return `${d}-${m}-${y}`;
};

const toBackendFilter = (f: PackageFilterUI): FilterPackageRequestDTO => {
  const dto: FilterPackageRequestDTO = {};
  if (f.billingPeriod)   dto.billingPeriod = f.billingPeriod;
  if (f.isActive !== "") dto.isActive      = f.isActive === "true";
  if (f.startDate)       dto.startDate     = toBackendDate(f.startDate);
  if (f.endDate)         dto.endDate       = toBackendDate(f.endDate);
  if (f.search.trim())   dto.search        = f.search.trim();
  return dto;
};

const showSuccess = (msg: string) => toast.success(msg, { autoClose: 4000 });
const showError   = (msg: string) => toast.error(msg,   { autoClose: 5000 });

interface IconFieldProps {
  name: string; size?: number; color?: string; className?: string; onClick?: () => void;
}

const IconField: React.FC<IconFieldProps> = ({ name, size = 20, color = "inherit", className = "", onClick }) => {
  const DynamicIcon = FaIcons[name as keyof typeof FaIcons];
  if (!DynamicIcon) return null;
  return <DynamicIcon size={size} color={color} className={className} onClick={onClick} />;
};

const SectionHeader: React.FC<{ iconName: string; title: string }> = ({ iconName, title }) => (
  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 border-b pb-2">
    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50">
      <IconField name={iconName} size={14} color="#2563eb" />
    </span>
    {title}
  </h2>
);

const PackageDetailModal: React.FC<{ pkg: any; onClose: () => void }> = ({ pkg, onClose }) => {
  if (!pkg) return null;
  const sortedFeatures = [...(pkg.features ?? [])].sort(
    (a: any, b: any) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <IconField name="FaCube" size={16} color="#2563eb" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{pkg.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{pkg.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors ml-4"
          >
            <IconField name="FaTimes" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              <IconField name="FaCalendarAlt" size={10} /> {pkg.billingPeriod?.replace(/_/g, " ")}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pkg.recommended ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
              <IconField name={pkg.recommended ? "FaStar" : "FaRegStar"} size={10} />
              {pkg.recommended ? "Recommended" : "Not Recommended"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pkg.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
              <IconField name={pkg.isActive !== false ? "FaCheckCircle" : "FaTimesCircle"} size={10} />
              {pkg.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <IconField name="FaInfoCircle" size={13} /> Package Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Base Price",        value: `₹${Number(pkg.basePrice ?? 0).toLocaleString()}`, icon: "FaRupeeSign"       },
                { label: "Setup Fee",         value: `₹${Number(pkg.setupFee  ?? 0).toLocaleString()}`, icon: "FaMoneyBillWave"   },
                { label: "Package Days",      value: pkg.packageDays      ?? "—",                       icon: "FaCalendar"        },
                { label: "Trial Days",        value: pkg.trialDays        ?? "—",                       icon: "FaClock"           },
                { label: "Display Order",     value: pkg.displayOrder     ?? "—",                       icon: "FaSortNumericDown" },
                { label: "Total Subscribers", value: pkg.totalSubscribers ?? "—",                       icon: "FaUsers"           },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <IconField name={icon} size={11} color="#9ca3af" />
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </section>
          {/* Features */}
          {sortedFeatures.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <IconField name="FaListUl" size={13} /> Features ({sortedFeatures.length})
              </h3>
              <div className="space-y-2">
                {sortedFeatures.map((feature: any, index: number) => (
                  <div
                    key={feature.packageFeatureId ?? index}
                    className="flex items-start gap-3 border border-gray-100 rounded-xl px-4 py-3 bg-white hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {feature.displayOrder}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{feature.featureName}</p>
                      {feature.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feature.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">
                          {feature.scope?.replace(/_/g, " ")}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-700">
                          {feature.limitType === "NONE"
                            ? "No limit"
                            : `${feature.limitType}: ${feature.limitValue}${feature.unit ? ` ${feature.unit}` : ""}`}
                        </span>
                        {feature.operations?.map((operation: string) => (
                          <span key={operation} className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">
                            {operation}
                          </span>
                        ))}
                        <span className={`rounded-md px-2 py-1 ${feature.isEnabled ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {feature.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-700 transition-colors"
          >
            <IconField name="FaTimes" size={13} /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OperationsToggleGroup: React.FC<{
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  loading?: boolean;
}> = ({ options, selected, onChange, loading }) => {
  const toggle    = (op: string) =>
    onChange(selected.includes(op) ? selected.filter((s) => s !== op) : [...selected, op]);
  const toggleAll = () =>
    onChange(selected.length === options.length ? [] : [...options]);

  if (loading) return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center gap-2 text-sm text-gray-400 italic">
      <IconField name="FaSpinner" size={14} color="#9ca3af" className="animate-spin" /> Loading operations...
    </div>
  );

  if (options.length === 0) return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center gap-2 text-sm text-gray-400 italic">
      <IconField name="FaExclamationCircle" size={14} color="#9ca3af" /> No operations available.
    </div>
  );

  const allSelected = selected.length === options.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={toggleAll}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 ${
            allSelected ? "bg-gray-700 text-white border-gray-700" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <IconField name={allSelected ? "FaCheckSquare" : "FaSquare"} size={13} />
          {allSelected ? "All Selected" : "Select All"}
        </button>
        <div className="h-5 w-px bg-gray-200" />
        {options.map((op) => {
          const colors     = OPERATION_COLORS[op] ?? { active: "bg-indigo-500 text-white border-indigo-500", inactive: "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50" };
          const isSelected = selected.includes(op);
          return (
            <button
              key={op}
              type="button"
              onClick={() => toggle(op)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 shadow-sm ${isSelected ? colors.active : colors.inactive}`}
            >
              <IconField name={OPERATION_ICONS[op] ?? "FaCircle"} size={13} />
              <span>{op.replace(/_/g, " ")}</span>
              {isSelected && <IconField name="FaCheck" size={11} className="ml-0.5 opacity-80" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-gray-500">
          <IconField name="FaCheckCircle" size={11} color="#6b7280" />
          {selected.length} of {options.length} operation{selected.length !== 1 ? "s" : ""} selected:{" "}
          <span className="font-medium text-gray-700">{selected.join(", ")}</span>
        </p>
      )}
    </div>
  );
};

interface FilterBarProps {
  control:              any;
  billingPeriodOptions: { label: string; value: string }[];
  isLoading:            boolean;
  onReset:              () => void;
  activeCount:          number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  control,
  billingPeriodOptions,

}) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
 
    </div>

    <div className="px-5 pt-2 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4">
        <div>
          <TextField name="search" label="Search" control={control} placeholder="Search packages…" />
        </div>
        <div>
          <Dropdown
            name="billingPeriod"
            label="Billing Period"
            control={control}
            options={[...billingPeriodOptions]}
          />
        </div>
        <div>
          <Dropdown
            name="isActive"
            label="Status"
            control={control}
            options={[
              // {      value: ""      },
              { label: "Active",   value: "true"  },
              { label: "Inactive", value: "false" },
            ]}
          />
        </div>
        <div>
          <BirthDateField name="startDate" label="Start Date" control={control} />
        </div>
        <div>
          <DateField name="endDate" label="End Date" control={control} />
        </div>
      </div>
    </div>
  </div>
);

const PackageManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [view,             setView            ] = useState<"table" | "form">("table");
  const [editingId,        setEditingId       ] = useState<number | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [viewingPackage,   setViewingPackage  ] = useState<any | null>(null);
  const [isFetchingView,   setIsFetchingView  ] = useState(false);
  const [recommended,        setRecommended       ] = useState(false);

  const {
    control: filterControl,
    watch:   filterWatch,
    reset:   filterReset,
  } = useForm<PackageFilterUI>({ defaultValues: DEFAULT_FILTERS });

  const filterValues = filterWatch();
  const activeFilterCount = useMemo(
    () => Object.values(filterValues).filter(Boolean).length,
    [filterValues]
  );
  const backendFilter = useMemo(
    () => toBackendFilter(filterValues),
    [filterValues]
  );
  const filterSignature = JSON.stringify(backendFilter);

  useEffect(() => {
    setPage(0);
  }, [filterSignature]);

  const handleFilterReset = useCallback(() => {
    filterReset(DEFAULT_FILTERS);
  }, [filterReset]);

  const hasActiveFilters = activeFilterCount > 0;
  const {
    data:       allPackagesData,
    isLoading:  isAllLoading,
    isFetching: isAllFetching,
  } = usePackagePage(page, pageSize);

  const {
    data:       filteredPackagesData,
    isLoading:  isFilteredLoading,
    isFetching: isFilteredFetching,
  } = useFilteredPackages(
    backendFilter,
    page,
    pageSize,
    undefined,
    undefined,
    hasActiveFilters,
  );

  const packagesData    = hasActiveFilters ? filteredPackagesData : allPackagesData;
  const isTableLoading  = hasActiveFilters ? isFilteredLoading    : isAllLoading;
  const isTableFetching = hasActiveFilters ? isFilteredFetching   : isAllFetching;

  useEffect(() => {
    const totalPages = packagesData?.totalPages ?? 0;
    if (totalPages > 0 && page >= totalPages) setPage(totalPages - 1);
  }, [packagesData?.totalPages, page]);

  const {
    data: dropdownOptions,
    isLoading: isLoadingDropdowns,
    isError: isDropdownOptionsError,
    error: dropdownOptionsError,
  } = usePackageDropdownOptions();
  const { mutateAsync: createPackage, isPending: isCreating     } = useCreatePackage();
  const { mutateAsync: updatePackage, isPending: isUpdating     } = useUpdatePackage();
  const { mutateAsync: deletePackage                            } = useDeletePackage();

  const isSubmitting = isCreating || isUpdating;

  const billingPeriods = dropdownOptions?.billingPeriods ?? [];
  const limitTypes = dropdownOptions?.limitTypes ?? [];
  const scopes = dropdownOptions?.scopes ?? [];
  const operations = dropdownOptions?.operations ?? [];
  const toBillingPeriodOptions = billingPeriods.map((period) => ({
    label: period.replace(/_/g, " "),
    value: period,
  }));
  const toLimitTypeOptions = limitTypes.map((limitType) => ({
    label: limitType.replace(/_/g, " "),
    value: limitType,
  }));
  const toScopeOptions = scopes.map((scope) => ({
    label: scope.replace(/_/g, " "),
    value: scope,
  }));
  const tableRows: PackageRow[] = useMemo(
    () =>
      (packagesData?.packages ?? []).map((pkg) => ({
        id:               pkg.packageId,
        packageId:        pkg.packageId,
        name:             pkg.name,
        billingPeriod:    pkg.billingPeriod,
        basePrice:        pkg.basePrice,
        packageDays:      pkg.packageDays,
        trialDays:        pkg.trialDays,
        totalSubscribers: pkg.totalSubscribers ?? 0,
        isActive:         pkg.isActive         ?? true,
        recommended:      pkg.recommended,
      })),
    [packagesData]
  );
  const { handleSubmit, control, reset, register, watch, setValue } = useForm<PackageFormData>({
    defaultValues: {
      name: "", description: "", basePrice: 0, setupFee: 0,
      packageDays: 0, trialDays: 0, displayOrder: 0,
      billingPeriod: "", features: [],
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } =
    useFieldArray({ control, name: "features" });
  const resetLocalState = useCallback((pkg?: { recommended?: boolean }) => {
    setRecommended(pkg?.recommended ?? false);
  }, []);

  const closeForm = useCallback(() => {
    reset();
    resetLocalState();
    setEditingId(null);
    setView("table");
  }, [reset, resetLocalState]);

  const onSubmit = async (data: PackageFormData) => {
    const payload: CreatePackageRequestDTO = {
      name: data.name,
      description: data.description,
      basePrice: Number(data.basePrice),
      billingPeriod: data.billingPeriod,
      packageDays: Number(data.packageDays),
      trialDays: Number(data.trialDays),
      setupFee: Number(data.setupFee),
      displayOrder: Number(data.displayOrder),
      recommended,
      features: data.features.map((feature) => ({
        ...feature,
        limitValue: Number(feature.limitValue),
        operations: feature.operations ?? [],
      })),
    };
    try {
      if (editingId !== null) {
        await updatePackage({ packageId: editingId, data: payload });
        showSuccess(`Package "${data.name}" updated successfully!`);
      } else {
        await createPackage(payload);
        showSuccess(`Package "${data.name}" created successfully!`);
      }
      reset();
      resetLocalState();
      setEditingId(null);
      setView("table");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      showError(error?.message || "Operation failed. Please try again.");
    }
  };

  // Load package data into form for editing
  const handleEdit = async (id: string | number) => {
    const packageId = Number(id);
    setIsFetchingDetail(true);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const pkg = await packageService.getById(packageId);
      reset({
        name:         pkg.name,
        description:  pkg.description,
        basePrice:    pkg.basePrice,
        setupFee:     pkg.setupFee ?? 0,
        packageDays:  pkg.packageDays,
        trialDays:    pkg.trialDays,
        displayOrder: pkg.displayOrder,
        billingPeriod:pkg.billingPeriod  ?? "",
        features: (pkg.features ?? []).map((feature) => ({
          featureName: feature.featureName ?? "",
          description: feature.description ?? "",
          scope: feature.scope ?? "",
          operations: feature.operations ?? [],
          limitType: feature.limitType ?? "NONE",
          limitValue: feature.limitValue ?? 0,
          unit: feature.unit ?? "",
          isEnabled: feature.isEnabled ?? true,
          displayOrder: feature.displayOrder ?? 0,
        })),
      });
      resetLocalState(pkg);
      setEditingId(packageId);
    } catch (error: any) {
      showError(`Failed to load package details: ${error?.message || "Please try again."}`);
      setView("table");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast("Are you sure you want to delete this package?"))) return;
    const packageId = Number(id);
    try {
      await deletePackage(packageId);
      showSuccess("Package deleted successfully!");
      if (editingId === packageId) closeForm();
    } catch (error: any) {
      showError(`Failed to delete package: ${error?.message || "Please try again."}`);
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!(await confirmToast(`Are you sure you want to delete ${ids.length} package(s)?`))) return;
    try {
      await Promise.all(ids.map((id) => deletePackage(Number(id))));
      showSuccess(`${ids.length} package(s) deleted successfully!`);
      closeForm();
    } catch (error: any) {
      showError(`Failed to delete packages: ${error?.message || "Please try again."}`);
    }
  };

  const handleView = async (id: string | number) => {
    const packageId = Number(id);
    setIsFetchingView(true);
    try {
      const pkg = await packageService.getById(packageId);
      setViewingPackage(pkg);
    } catch (error: any) {
      showError(`Failed to load package details: ${error?.message || "Please try again."}`);
    } finally {
      setIsFetchingView(false);
    }
  };

  const handleShowForm = useCallback(
    (val: boolean) => {
      if (val) {
        reset();
        resetLocalState();
        setEditingId(null);
        setView("form");
      } else {
        setView("table");
      }
    },
    [reset, resetLocalState]
  );

  const columns = [
    { key: "name",             label: "Package Name"   },
    { key: "billingPeriod",    label: "Billing Period" },
    {
      key: "basePrice",
      label: "Base Price",
      render: (v: number) => `₹${Number(v).toLocaleString()}`,
    },
    { key: "totalSubscribers", label: "Subscribers"    },
    {
      key: "isActive",
      label: "Status",
      render: (v: boolean) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
          <IconField name={v ? "FaCheckCircle" : "FaTimesCircle"} size={10} />
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {isFetchingView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-white">
              <IconField name="FaSpinner" size={28} color="white" className="animate-spin" />
              <span className="text-sm font-medium">Loading package details...</span>
            </div>
          </div>
        )}
        {viewingPackage && (
          <PackageDetailModal pkg={viewingPackage} onClose={() => setViewingPackage(null)} />
        )}
        {view === "form" ? (
          <div className="w-full mx-auto">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">

              {/* Form header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <IconField name={editingId ? "FaEdit" : "FaPlusCircle"} size={18} color="#2563eb" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {editingId ? "Edit Package" : "Create Package"}
                    </h1>
                    <p className="text-gray-600 mt-0.5">Manage your subscription packages</p>
                  </div>
                </div>
              </div>
              {isFetchingDetail ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <IconField name="FaSpinner" size={28} color="#9ca3af" className="animate-spin" />
                    <span className="text-sm font-medium">Loading package details...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {isDropdownOptionsError && (
                    <div
                      role="alert"
                      className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      Failed to load package options:{" "}
                      {dropdownOptionsError instanceof Error
                        ? dropdownOptionsError.message
                        : "Please try again."}
                    </div>
                  )}
                  <div className="p-6 space-y-10">

                    {/* Basic Information */}
                    <section className="space-y-6">
                      <SectionHeader iconName="FaInfoCircle" title="Basic Information" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextField
                          name="name"
                          label="Package Name"
                          placeholder="Enter package name"
                          control={control}
                          required
                        />
                        <div className="md:col-span-2">
                          <TextareaField
                            name="description"
                            label="Description"
                            placeholder="Enter package description"
                            control={control}
                            rows={3}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Pricing */}
                    <section className="space-y-6">
                      <SectionHeader iconName="FaRupeeSign" title="Pricing" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AmountField<PackageFormData>
                          name="basePrice"
                          control={control}
                          label="Base Price (₹)"
                          placeholder="Enter base price"
                          required
                        />
                        <AmountField<PackageFormData>
                          name="setupFee"
                          control={control}
                          label="Setup Fee (₹)"
                          placeholder="Enter setup fee"
                          required
                        />
                        <Dropdown
                          name="billingPeriod"
                          label="Billing Period"
                          control={control}
                          required
                          options={toBillingPeriodOptions}
                          disabled={isLoadingDropdowns || isDropdownOptionsError}
                        />
                      </div>
                    </section>

                    {/* Duration */}
                    <section className="space-y-6">
                      <SectionHeader iconName="FaClock" title="Duration" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NumberField name="packageDays" label="Package Days" placeholder="Enter package days" control={control} required />
                        <NumberField name="trialDays"   label="Trial Days"   placeholder="Enter trial days"   control={control} required />
                      </div>
                    </section>

                    {/* Features */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50">
                            <IconField name="FaListUl" size={14} color="#2563eb" />
                          </span>
                          Features
                        </h2>
                        <button
                          type="button"
                          onClick={() =>
                            appendFeature({
                              featureName:        "",
                              description:        "",
                              scope:              "",
                              operations:         [],
                              limitType:          "NONE",
                              limitValue:         0,
                              unit:               "",
                              isEnabled:          true,
                              displayOrder:       featureFields.length,
                            })
                          }
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-300 hover:border-blue-500 rounded-lg px-3 py-1.5 transition"
                        >
                          <IconField name="FaPlus" size={12} /> Add Feature
                        </button>
                      </div>

                      {featureFields.length === 0 && (
                        <p className="flex items-center gap-2 text-sm text-gray-400 italic">
                          <IconField name="FaExclamationCircle" size={14} color="#9ca3af" /> No features added yet.
                        </p>
                      )}

                      <div className="space-y-4">
                        {featureFields.map((field, index) => (
                          <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="absolute top-3 right-3 inline-flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                            >
                              <IconField name="FaTrash" size={11} /> Remove
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextField name={`features.${index}.featureName`} label="Feature Name" placeholder="Enter feature name" control={control} required />
                              <TextField name={`features.${index}.description`} label="Description"  placeholder="Enter description"  control={control} />
                              <Dropdown
                                name={`features.${index}.scope`}
                                label="Scope"
                                control={control}
                                required
                                options={toScopeOptions}
                                disabled={isLoadingDropdowns || isDropdownOptionsError}
                              />
                              <Dropdown
                                name={`features.${index}.limitType`}
                                label="Limit Type"
                                control={control}
                                required
                                options={toLimitTypeOptions}
                                disabled={isLoadingDropdowns || isDropdownOptionsError}
                              />
                              <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                  <IconField name="FaShieldAlt" size={12} color="#6b7280" /> Allowed Operations
                                </label>
                                <OperationsToggleGroup
                                  options={operations}
                                  selected={watch(`features.${index}.operations`) ?? []}
                                  onChange={(value) =>
                                    setValue(`features.${index}.operations`, value, { shouldDirty: true })
                                  }
                                  loading={isLoadingDropdowns}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                  <IconField name="FaSortNumericDown" size={12} color="#6b7280" /> Limit Value
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  {...register(`features.${index}.limitValue`, {
                                    valueAsNumber: true,
                                    min: 0,
                                  })}
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <TextField name={`features.${index}.unit`} label="Unit" placeholder="e.g. students, GB" control={control} />
                              <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                  <IconField name="FaSortNumericDown" size={12} color="#6b7280" /> Display Order
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  {...register(`features.${index}.displayOrder`, {
                                    valueAsNumber: true,
                                    min: 0,
                                  })}
                                  placeholder="0"
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                  type="checkbox"
                                  {...register(`features.${index}.isEnabled`)}
                                  className="accent-blue-600 w-4 h-4"
                                />
                                Feature enabled
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="space-y-6">
                      <SectionHeader iconName="FaCog" title="Display Settings" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NumberField name="displayOrder" label="Display Order" placeholder="Enter display order" control={control} required />
                        <div className="flex flex-col gap-1 justify-center">
                          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <IconField name="FaStar" size={13} color="#6b7280" /> Recommended
                          </label>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              onClick={() => setRecommended(!recommended)}
                              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${recommended ? "bg-blue-600" : "bg-gray-300"}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${recommended ? "translate-x-7" : "translate-x-1"}`} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                              {recommended
                                ? <><IconField name="FaStar" size={13} color="#d97706" /><span className="text-yellow-600 font-medium">Yes</span></>
                                : <><IconField name="FaRegStar" size={13} color="#9ca3af" /><span>No</span></>
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <Button
                        name="Cancel"
                        loading={false}
                        isDisable={isSubmitting}
                        onClick={closeForm}
                        showAlways = {true}
                        type="button"
                        icon={<IconField name="FaTimes" size={13} />}
                      />
                      <Button
                        name={isSubmitting ? "Saving..." : editingId ? "Update Package" : "Save Package"}
                        loading={isSubmitting}
                        isDisable={isSubmitting || isLoadingDropdowns || isDropdownOptionsError}
                        type="submit"
                        showAlways = {true}
                        icon={
                          isSubmitting
                            ? <IconField name="FaSpinner" size={14} className="animate-spin" />
                            : <IconField name={editingId ? "FaSave" : "FaPlusCircle"} size={14} />
                        }
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

        ) : (
          <>
            <FilterBar
              control={filterControl}
              billingPeriodOptions={toBillingPeriodOptions}
              isLoading={isTableFetching}
              onReset={handleFilterReset}
              activeCount={activeFilterCount}
            />

            <ControlledTable
              title="Package Management"
              columns={columns}
              data={tableRows}
              fullData={tableRows}
              forceShowActions={true}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              btn={true}
              btnName="Add Package"
              forceShowBtn={true}
              showForm={handleShowForm}
              showSearch={false}
              showExport={true}
              actionColumn={true}
              showSelectAll={true}
              showPaginationFooter={true}
              serverPage={packagesData?.currentPage ?? page}
              serverTotalPages={packagesData?.totalPages ?? 0}
              serverTotalItems={packagesData?.totalItems ?? 0}
              serverPageSize={packagesData?.size ?? pageSize}
              onServerPageChange={setPage}
              onServerPageSizeChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
              loading={isTableFetching}
              emptyMessage={
                isTableLoading
                  ? "Loading packages..."
                  : activeFilterCount > 0
                  ? "No packages match the selected filters"
                  : "No packages available"
              }
              exportFilename="packages_list"
              exportTitle="Packages Report"
              // loading={isTableLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PackageManagement;