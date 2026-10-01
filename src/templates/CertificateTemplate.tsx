import React from "react";

interface Student {
  studentName: string;
  dob: string;
  admissionNo: string;
  category?: string;
  gender: string;
  fatherName: string;
  class: string;
  mobile: string;
}

interface CertificateTemplateProps {
  student: Student;
  onBack: () => void;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ student, onBack }) => {
  return (
    <div className="p-4 md:p-8">
    
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto p-6 border-[10px] border-yellow-700 font-serif bg-white shadow-lg">
        <div className="text-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mount_Carmel_School_logo.png/600px-Mount_Carmel_School_logo.png"
            alt="Logo"
            className="mx-auto mb-4 w-24"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-red-900 mb-1">
            Mount Carmel School
          </h1>
          <p className="text-sm md:text-base">
            23, Kings Street, CA, Phone: 0916-6766-144
          </p>
          <h2 className="text-xl md:text-2xl font-semibold mt-4 underline">
            Transfer Certificate
          </h2>
        </div>

        <div className="mt-6 text-sm md:text-base leading-relaxed">
          <p>
            Ref No: <strong>1111111</strong> &nbsp;&nbsp;&nbsp;&nbsp; Date:{" "}
            <strong>{new Date().toLocaleDateString()}</strong>
          </p>
          <p>
            This is to certify that <strong>{student.studentName}</strong> was born on{" "}
            <strong>{student.dob}</strong> and studied at our institution.
          </p>
          <p>
            He/She was admitted on <strong>{student.dob}</strong> under admission number{" "}
            <strong>{student.admissionNo}</strong>. He/She belongs to{" "}
            <strong>{student.category || "N/A"}</strong> category and is{" "}
            <strong>{student.gender}</strong>.
          </p>
          <p>
            Father's Name: <strong>{student.fatherName}</strong>
          </p>
          <p>
            Last studied in: <strong>{student.class}</strong>
          </p>
          <p>
            Mobile: <strong>{student.mobile}</strong>
          </p>
          <p>We wish the student success in all future endeavors.</p>
        </div>

        <div className="flex justify-between mt-12 text-sm md:text-base">
          <span className="text-center">
            __________________<br />Admin
          </span>
          <span className="text-center">
            __________________<br />Principal
          </span>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
