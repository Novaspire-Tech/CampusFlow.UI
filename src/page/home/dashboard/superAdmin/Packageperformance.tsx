import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { usePackages } from "../../../../hooks/queries/superAdmin/usePackage";
import { usePackage } from "../../../../hooks/queries/superAdmin/usePackage";
import { packageService } from "../../../../services/superAdmin/packageServices";

interface IconFieldProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}
const IconField: React.FC<IconFieldProps> = ({
  name, size = 20, color = "inherit", className = "", onClick,
}) => {
  const DynamicIcon = FaIcons[name as keyof typeof FaIcons];
  if (!DynamicIcon) return null;
  return <DynamicIcon size={size} color={color} className={className} onClick={onClick} />;
};

const OPERATION_BADGE_COLORS: Record<string, string> = {
  CREATE: "bg-green-100  text-green-700  border-green-200",
  READ:   "bg-blue-100   text-blue-700   border-blue-200",
  UPDATE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DELETE: "bg-red-100    text-red-600    border-red-200",
};
const OPERATION_ICONS: Record<string, string> = {
  CREATE: "FaPlus",
  READ:   "FaEye",
  UPDATE: "FaEdit",
  DELETE: "FaTrash",
};

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
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              <IconField name="FaTag" size={10} /> {pkg.category}
            </span>
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
                { label: "Base Price",    value: `₹${Number(pkg.basePrice ?? 0).toLocaleString()}`, icon: "FaRupeeSign"       },
                { label: "Setup Fee",     value: `₹${Number(pkg.setupFee  ?? 0).toLocaleString()}`, icon: "FaMoneyBillWave"   },
                { label: "Package Days",  value: pkg.packageDays  ?? "—",                           icon: "FaCalendar"        },
                { label: "Trial Days",    value: pkg.trialDays    ?? "—",                           icon: "FaClock"           },
                { label: "Display Order", value: pkg.displayOrder ?? "—",                           icon: "FaSortNumericDown" },
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

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <IconField name="FaShieldAlt" size={13} />
              Operations {pkg.operations?.length > 0 ? `(${pkg.operations.length})` : ""}
            </h3>
            {pkg.operations?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pkg.operations.map((op: string) => (
                  <span
                    key={op}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${OPERATION_BADGE_COLORS[op] ?? "bg-indigo-50 text-indigo-700 border-indigo-100"}`}
                  >
                    <IconField name={OPERATION_ICONS[op] ?? "FaCircle"} size={11} />
                    <span>{op.replace(/_/g, " ")}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-gray-400 italic">
                <IconField name="FaBan" size={13} color="#9ca3af" /> No operations assigned.
              </p>
            )}
          </section>

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
                    <div className="mt-0.5 w-6 h-6 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {feature.displayOrder}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{feature.featureName}</p>
                      {feature.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feature.description}</p>
                      )}
                    </div>
                    <IconField name="FaCheckCircle" size={14} color="#22c55e" className="mt-0.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          )}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <IconField name="FaLock" size={13} />
              Scopes {pkg.scopes?.length > 0 ? `(${pkg.scopes.length})` : ""}
            </h3>
            {pkg.scopes?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pkg.scopes.map((scope: string) => (
                  <span
                    key={scope}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    <IconField name="FaKey" size={10} /> {scope.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-gray-400 italic">
                <IconField name="FaBan" size={13} color="#9ca3af" /> No scopes assigned.
              </p>
            )}
          </section>
        </div>

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

const packageColors = [
  {
    border: "border-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
    badge: "bg-blue-100",
    progress: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconHover: "hover:bg-blue-200",
  },
  {
    border: "border-purple-100",
    bg: "bg-purple-50",
    text: "text-purple-600",
    badge: "bg-purple-100",
    progress: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100",
    iconHover: "hover:bg-purple-200",
  },
  {
    border: "border-indigo-100",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    badge: "bg-indigo-100",
    progress: "from-indigo-500 to-indigo-600",
    iconBg: "bg-indigo-100",
    iconHover: "hover:bg-indigo-200",
  },
];

const PackageCard: React.FC<{
  packageId: number;
  index: number;
  onView: (packageId: number) => void;
}> = ({ packageId, index, onView }) => {
  const { data: pkg, isLoading, isError } = usePackage(packageId);
  const color = packageColors[index % packageColors.length];

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 rounded-xl p-5 h-52" />;
  }

  if (isError || !pkg) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load package #{packageId}</p>
      </div>
    );
  }

  return (
    <div
      className={`group bg-white border-2 ${color.border} shadow-lg rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-bold ${color.text}`}>{pkg.name}</h4>

        <button
          type="button"
          title="View package details"
          onClick={() => onView(pkg.id ?? packageId)}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${color.iconBg} ${color.iconHover} transition-colors duration-200 cursor-pointer`}
        >
          <IconField name="FaEye" size={14} color="currentColor" className={color.text} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-800 mb-1">
          ₹{pkg.basePrice.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">per {pkg.billingPeriod || "year"}</p>
      </div>

      <div className="space-y-2 mb-4">
        {pkg.features.slice(0, 3).map((feature: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color.progress}`} />
            <span>{feature.featureName}</span>
          </div>
        ))}
        {pkg.features.length > 3 && (
          <p className="text-xs text-gray-500 italic">
            +{pkg.features.length - 3} more features
          </p>
        )}
      </div>
    </div>
  );
};


const PackagePerformance: React.FC = () => {
  const { data, isLoading, isError, error } = usePackages();


  const [viewingPackage, setViewingPackage] = useState<any | null>(null);
  const [isFetchingView, setIsFetchingView] = useState(false);

  const handleView = async (packageId: number) => {
    setIsFetchingView(true);
    try {
      const pkg = await packageService.getById(packageId);
      setViewingPackage(pkg);
    } catch (err: any) {
      console.error("Failed to load package details:", err?.message);
    } finally {
      setIsFetchingView(false);
    }
  };

  const CATEGORY_ORDER = ["BASIC", "STANDARD", "PREMIUM"];

  const packages = data?.packages ?? [];

  const sortedPackages = [...packages].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category?.toUpperCase().trim());
    const bi = CATEGORY_ORDER.indexOf(b.category?.toUpperCase().trim());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  if (isLoading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">Package Performance</h3>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-5 h-52" />
          ))}
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 border border-red-200">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Failed to Load Packages</h3>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (packages.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <p className="text-center text-gray-500 py-8">No packages found.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">

      {/* Full-screen loading overlay while fetching detail */}
      {isFetchingView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white">
            <IconField name="FaSpinner" size={28} color="white" className="animate-spin" />
            <span className="text-sm font-medium">Loading package details...</span>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {viewingPackage && (
        <PackageDetailModal
          pkg={viewingPackage}
          onClose={() => setViewingPackage(null)}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Package Performance</h3>
         
        </div>
      </div>

      {/* Cards sorted BASIC → STANDARD → PREMIUM */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {sortedPackages.map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            packageId={pkg.id}
            index={index}
            onView={handleView}   // ← passes the view handler down
          />
        ))}
      </div>
    </div>
  );
};

export default PackagePerformance;