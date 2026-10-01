import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaffByCode } from "../../../hooks/queries/humanResource/useStaffDirectory";
import { Button } from "../../../components/controlled";
import { IconField } from "../../../components";
import { useStaffPhoto } from "../../../hooks/queries/humanResource/useStaffPhoto";
import type { StaffDocuments } from "../../../types/humanResource/Staff";
import { openDocument } from "../../../hooks/useBlobImage";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";

const StaffView: React.FC = () => {
  const { staffCode } = useParams<{ staffCode: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "payroll" | "leave">("profile");

  const { data: staffData, isLoading, isError } = useStaffByCode(staffCode || "");
  const { photoUrl, loading: photoLoading, error: photoError } = useStaffPhoto(staffData?.photo ?? undefined);
  const { t } = useTranslation()
  const T = getPagesDataText(t)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <span className="mt-4 block text-gray-700 font-medium">{T.Loading}</span>
        </div>
      </div>
    );
  }

  if (isError || !staffData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <IconField name="FaExclamationTriangle" className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{T.ErrorLoadingData}</h2>
            <p className="text-gray-600 mb-6">{T.UnableToLoadStaffInformation}</p>
            <Button name={T.Back} loading={false} onClick={() => navigate(-1)} icon={<IconField name="FaArrowLeft" />} />
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${staffData.firstName} ${staffData.lastName}`;

  const profileData: Record<string, string> = {
  [T.Staff_Code]:         staffData.staffCode             || "N/A",
  [T.Phone]:              staffData.phone                 || "N/A",
  [T.Emergency_Contact_Number]:  staffData.emergencyContactNo    || "N/A",
  [T.Email]:              staffData.email                 || "N/A",
  [T.Gender]:             staffData.gender                || "N/A",
  [T.Date_Of_Birth]:      staffData.dateOfBirth           || "N/A",
  [T.Blood_Group]:        staffData.bloodGroup            || "N/A",
  [T.Date_Of_Joining]:    staffData.dateOfJoining         || "N/A",
  [T.Marital_Status]:     staffData.maritalStatus         || "N/A",
  [T.Father_Name]:        staffData.fatherName            || "N/A",
  [T.Mother_Name]:        staffData.motherName            || "N/A",
  [T.Qualification]:      staffData.qualification         || "N/A",
  [T.Work_Experience]:    staffData.workExperience        || "N/A",
  [T.Role]:                staffData.role                 || "N/A",
  [T.Department]:          staffData.department?.name     || "N/A",
  [T.Designation]:         staffData.designation?.name    || "N/A",
  [T.Class_Department]:      staffData.classDepartment?.name|| "N/A",
};

  const addressData: Record<string, string> = {
    [T.Current_Address]:   staffData.currentAddress   || "N/A",
    [T.Permanent_Address]: staffData.permanentAddress || "N/A",
  };

  const documents: StaffDocuments = {
    [T.Joining_Letter]: staffData.staffDocuments?.joiningLetter  || "N/A",
    [T.Resume]:        staffData.staffDocuments?.resume         || "N/A",
    [T.Other_Document]: staffData.staffDocuments?.otherDocument  || "N/A",
  };

  const bankAccountData: Record<string, string> = {
    [T.Bank_Name]: staffData.staffBankAccountDetails?.bankName       || "N/A",
    [T.bank_branch_name]: staffData.staffBankAccountDetails?.branch         || "N/A",
    [T.Bank_Account_Number]: staffData.staffBankAccountDetails?.accountNumber  || "N/A",
    [T.IFSC_Code]: staffData.staffBankAccountDetails?.IFSCCode       || "N/A",
  };

  const socialMediaData: Record<string, string> = {
    [T.facebook_page]:  staffData.socialMediaLink?.faceBook  || "N/A",
    [T.twitter_page]:   staffData.socialMediaLink?.twitter   || "N/A",
    [T.instagram_url]: staffData.socialMediaLink?.instagram || "N/A",
    [T.linkedin_url]:  staffData.socialMediaLink?.linkedIn  || "N/A",
  };

  const payroll = staffData.payRoll;
  const leave   = staffData.staffAssignedLeave;

  const leaveData = {
    [T.Sick_Leaves]:     { assigned: leave?.sickLeaveAssigned     || 0, used: leave?.sickLeaveCount     || 0 },
    [T.Casual_Leaves]:   { assigned: leave?.casualLeaveAssigned   || 0, used: leave?.casualLeaveCount   || 0 },
    [T.Maternity_Leaves]:{ assigned: leave?.maternityLeaveAssigned|| 0, used: leave?.maternityLeaveCount|| 0 },
    [T.Annual_Leaves]:   { assigned: leave?.annualLeaveAssigned   || 0, used: leave?.annualLeaveCount   || 0 },
  } as const;

  const leaveEntries = Object.entries(leaveData).map(([type, { assigned, used }]) => ({
    type,
    assigned,
    used,
    available: assigned - used,
  }));

  const tabClass = (tab: string) =>
    `flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
      activeTab === tab
        ? "bg-gradient-to-r from-blue-300 to-indigo-600 text-white"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  // ─── Reusable section card ─────────────────────────────────────────────────

  const InfoTable = ({
    title, icon, headerClass, hoverClass, entries, renderValue,
  }: {
    title: string
    icon: string
    headerClass: string
    hoverClass: string
    entries: [string, string][]
    renderValue?: (key: string, value: string) => React.ReactNode
  }) => (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md overflow-hidden">
      <div className={`${headerClass} px-6 py-4`}>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <IconField name={icon} size={24} />
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key} className={`border-b border-gray-200 ${hoverClass} transition-colors`}>
                <td className="px-6 py-4 font-semibold text-gray-700 w-1/3 bg-gray-50">{key}</td>
                <td className="px-6 py-4 text-gray-900">
                  {renderValue ? renderValue(key, value) : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header Card ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-gray-300 to-gray-400"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20">

              {/* Photo */}
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                  {photoLoading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  ) : photoUrl && !photoError ? (
                    <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <IconField name="FaUserCircle" className="text-gray-400 text-7xl md:text-8xl" />
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Name & Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{fullName}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600 mb-3">
                  <span className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                    <IconField name="FaBriefcase" size={14} /> {staffData.role}
                  </span>
                  <span className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                    <IconField name="FaIdBadge" size={14} /> {staffData.staffCode}
                  </span>
                  <span className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    <IconField name="FaBuilding" size={14} />
                    {staffData.department?.name || staffData.department?.departmentName}
                  </span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                  {staffData.designation?.name || staffData.designation?.designationName}
                </p>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                <Button name={T.Back} onClick={() => navigate(-1)} icon={<IconField name="FaArrowLeft" />} loading={false} />
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { color: "blue",   icon: "FaEnvelope",      label: T.Email,  value: staffData.email },
                { color: "green",  icon: "FaPhone",         label: T.Phone,  value: staffData.phone },
                { color: "purple", icon: "FaCalendarCheck", label: T.Date_Of_Joining, value: staffData.dateOfJoining || "N/A" },
              ].map(({ color, icon, label, value }) => (
                <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-4 rounded-xl border border-${color}-200`}>
                  <div className="flex items-center gap-3">
                    <div className={`bg-${color}-500 p-3 rounded-lg`}>
                      <IconField name={icon} className="text-white text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-${color}-600 font-medium mb-1`}>{label}</p>
                      <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab("profile")} className={tabClass("profile")}>
              <IconField name="FaUser" size={20} /> <span>{T.Profile}</span>
            </button>
            <button onClick={() => setActiveTab("payroll")} className={tabClass("payroll")}>
              <IconField name="FaMoneyBill" size={20} /> <span>{T.Payroll}</span>
            </button>
            <button onClick={() => setActiveTab("leave")} className={tabClass("leave")}>
              <IconField name="FaPlane" size={20} /> <span>{T.Leave}</span>
            </button>
          </div>

          <div className="p-6">

            {/* ── Profile Tab ─────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <InfoTable
                  title={T.Personal_Information} icon="FaUserCircle"
                  headerClass="bg-gradient-to-r from-yellow-400 to-orange-500"
                  hoverClass="hover:bg-blue-50"
                  entries={[
                    ...Object.entries(profileData),
                    ...(staffData.note && staffData.note !== "N/A" ? [["Note", staffData.note] as [string, string]] : []),
                  ]}
                />

                <InfoTable
                  title={T.Address_Details} icon="FaMapMarkerAlt"
                  headerClass="bg-gradient-to-r from-green-600 to-teal-600"
                  hoverClass="hover:bg-green-50"
                  entries={Object.entries(addressData)}
                />

                <InfoTable
                  title={T.Bank_Account_Details} icon="FaUniversity"
                  headerClass="bg-gradient-to-r from-purple-600 to-pink-600"
                  hoverClass="hover:bg-purple-50"
                  entries={Object.entries(bankAccountData)}
                />

                <InfoTable
                  title={T.Staff_Documents} icon="FaShareAlt"
                  headerClass="bg-gradient-to-r from-blue-500 to-blue-400"
                  hoverClass="hover:bg-orange-50"
                  entries={Object.entries(documents)}
                  renderValue={(_, value) =>
                    value && value !== "N/A" ? (
                      <p className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 cursor-pointer" onClick={() => openDocument(value)}>
                        {value} <IconField name="FaExternalLinkAlt" size={12} />
                      </p>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )
                  }
                />

                <InfoTable
                  title={T.Social_Media_Links} icon="FaShareAlt"
                  headerClass="bg-gradient-to-r from-orange-500 to-red-500"
                  hoverClass="hover:bg-orange-50"
                  entries={Object.entries(socialMediaData)}
                  renderValue={(_, value) =>
                    value && value !== "N/A" ? (
                      <a href={value} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                        {value} <IconField name="FaExternalLinkAlt" size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )
                  }
                />
              </div>
            )}

            {/* ── Payroll Tab ──────────────────────────────────────────── */}
            {activeTab === "payroll" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{T.Basic_salary}</h3>
                    <IconField name="FaMoneyBillWave" className="text-3xl opacity-80" />
                  </div>
                  <p className="text-4xl font-bold">₹{(payroll?.basicSalary || 0).toLocaleString()}</p>
                  <p className="text-sm mt-2 opacity-90">{T.Per_Monthly_Salary}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{T.Employment_Type}</h3>
                    <IconField name="FaBriefcase" className="text-3xl opacity-80" />
                  </div>
                  <p className="text-2xl font-bold">{(payroll?.employmentType || "N/A").replace("_", " ")}</p>
                  <p className="text-sm mt-2 opacity-90">{T.Contract_Status}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{T.work_location}</h3>
                    <IconField name="FaMapMarkedAlt" className="text-3xl opacity-80" />
                  </div>
                  <p className="text-2xl font-bold">{payroll?.workLocation || "N/A"}</p>
                  <p className="text-sm mt-2 opacity-90">{T.work_location}</p>
                </div>
              </div>
            )}

            {/* ── Leave Tab ────────────────────────────────────────────── */}
            {activeTab === "leave" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leaveEntries.map(({ type, assigned, used, available }) => {
                    const usagePercent  = assigned > 0 ? (used / assigned) * 100 : 0;
                    const isLowBalance  = available > 0 && available <= 2;
                    const isNoBalance   = available <= 0;
                    const statusColor   = isNoBalance ? "red" : isLowBalance ? "yellow" : "blue";

                    return (
                      <div key={type} className={`rounded-xl p-6 shadow-lg transition-all hover:shadow-xl bg-gradient-to-br from-${statusColor}-50 to-${statusColor}-100 border-2 border-${statusColor}-200`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{type}</h3>
                            <p className="text-sm text-gray-600">Total: {assigned} {T.Days}</p>
                          </div>
                          <div className={`p-3 rounded-lg bg-${statusColor}-500`}>
                            <IconField name="FaPlane" className="text-2xl text-white" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{T.Used}:</span>
                            <span className="text-lg font-bold text-red-600">{used} {T.Days}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{T.Available}:</span>
                            <span className={`text-lg font-bold text-${statusColor}-600`}>{available} {T.Days}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">{T.Usage}</span>
                            <span className="text-xs font-semibold text-gray-700">{Math.round(usagePercent)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                usagePercent >= 100 ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : usagePercent >= 80 ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>

                        {(isNoBalance || isLowBalance) && (
                          <div className={`mt-3 p-2 bg-${statusColor}-100 border border-${statusColor}-300 rounded-lg`}>
                            <p className={`text-xs text-${statusColor}-700 font-medium`}>
                              {isNoBalance ? T.No_Of_Remaining_Leaves : T.Low_Balance}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Leave Summary */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconField name="FaChartBar" size={20} /> {T.Leave_Summary}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const totalAssigned = leaveEntries.reduce((s, l) => s + l.assigned, 0);
                      const totalUsed     = leaveEntries.reduce((s, l) => s + l.used, 0);
                      const totalAvail    = leaveEntries.reduce((s, l) => s + l.available, 0);
                      const overallPct    = totalAssigned > 0 ? Math.round((totalUsed / totalAssigned) * 100) : 0;
                      return [
                        { color: "blue",   value: totalAssigned, label: T.Total_Assigned },
                        { color: "red",    value: totalUsed,     label: T.Total_Used },
                        { color: "green",  value: totalAvail,    label: T.Total_Available },
                        { color: "purple", value: `${overallPct}%`, label: T.Overall_Usage },
                      ].map(({ color, value, label }) => (
                        <div key={label} className={`text-center p-4 bg-${color}-50 rounded-lg`}>
                          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                          <p className="text-sm text-gray-600 mt-1">{label}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffView;