import React from "react";

type MarksheetTemplateData = {
  templateName: string;
  schoolName: string;
  examName: string;
  address: string;
  session: string;
  classLevel: string;
  schoolClassId: string;
  searchSession: string;
  studentName: string;
  rollNo: string;
  motherName: string;
  dob: string;
  leftLogo: File | string | null;
  teacherSign: File | string | null;
  principalSign: File | string | null;
  managerSign: File | string | null;
  columns: { label?: string }[];
  subjects: { name?: string }[];
};

interface MarksheetPreviewProps {
  data: Partial<MarksheetTemplateData>;
}

const MarksheetPreview: React.FC<MarksheetPreviewProps> = ({ data }) => {
  const getImgSrc = (file: any) => {
    if (!file) return "";
    if (typeof file === "string") return file.startsWith("data:image") ? file : "";
    if (file instanceof File) {
      try {
        return URL.createObjectURL(file);
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  return (
    <div className="w-full max-w-[800px] border-2 border-slate-300 p-8 bg-white shadow-lg mx-auto font-sans text-slate-800">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-slate-900 uppercase">
          {data.schoolName || "School Name"}
        </h1>
        <p className="text-sm text-slate-600 italic border-b pb-2 mb-4">
          {data.address}
        </p>

        <div className="flex justify-between items-center px-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden">
            {data.leftLogo ? (
              <img
                src={getImgSrc(data.leftLogo)}
                className="w-full h-full object-contain"
                alt="logo"
              />
            ) : (
              <span className="text-[10px] text-slate-400">LOGO</span>
            )}
          </div>
          <div className="text-center flex-1">
            <h2 className="text-lg font-bold text-blue-800 underline uppercase">
              {data.examName}
            </h2>
            <p className="text-sm font-semibold mt-1">
              Session: {data.session || "N/A"}
            </p>
            <p className="text-xs font-bold text-orange-600">
              CLASS: {data.classLevel || "N/A"}
            </p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-y-2 gap-x-8 text-xs">
        <div className="flex justify-start pb-1">
          <span className="font-semibold text-black">Student Name:</span>
          <span className="font-bold ml-2">{data.studentName || "________________"}</span>
        </div>
        <div className="flex justify-start pb-1">
          <span className="font-semibold text-black">Roll No:</span>
          <span className="font-bold ml-2">{data.rollNo || "____"}</span>
        </div>
        <div className="flex justify-start pb-1">
          <span className="font-semibold text-black">Mother's Name:</span>
          <span className="font-bold ml-2">{data.motherName || "________________"}</span>
        </div>
        <div className="flex justify-start pb-1">
          <span className="font-semibold text-black">Date of Birth:</span>
          <span className="font-bold ml-2">{data.dob || "__________"}</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-400 text-[12px]">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="border border-slate-400 p-2 text-left">Scholastic Areas</th>
            {data.columns?.map((col, i) => (
              <th key={i} className="border border-slate-400 p-2 text-center">
                {col.label || `Term ${i + 1}`}
              </th>
            ))}
            <th className="border border-slate-400 p-2 text-center">Grade</th>
          </tr>
        </thead>
        <tbody>
          {data.subjects?.map((sub, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="border border-slate-400 p-2 font-medium">
                {sub.name || `Subject ${i + 1}`}
              </td>
              {data.columns?.map((_, ci) => (
                <td key={ci} className="border border-slate-400 p-2 text-center text-slate-400">-</td>
              ))}
              <td className="border border-slate-400 p-2 text-center text-slate-400">-</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 flex justify-between text-[10px] uppercase font-bold px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 flex items-end">
            {data.teacherSign && <img src={getImgSrc(data.teacherSign)} className="h-8 object-contain" alt="sign" />}
          </div>
          Class Teacher
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 flex items-end">
            {data.principalSign && <img src={getImgSrc(data.principalSign)} className="h-8 object-contain" alt="sign" />}
          </div>
          Principal
        </div>
      </div>
    </div>
  );
};

export default MarksheetPreview;