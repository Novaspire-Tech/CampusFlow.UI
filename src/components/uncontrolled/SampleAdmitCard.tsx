import React from "react";

interface AdmitCardData {
  heading?: string;
  title?: string;
  backgroundImage?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  name?: boolean;
  fatherName?: boolean;
  motherName?: boolean;
  dob?: boolean;
  admissionNo?: boolean;
  rollNo?: boolean;
  address?: boolean;
  gender?: boolean;
  class?: boolean;
  section?: boolean;
  footerText?: string;
}

interface SampleAdmitCardProps {
  data?: AdmitCardData;
}

const SampleAdmitCard: React.FC<SampleAdmitCardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="p-6 bg-gray-100 rounded shadow-lg mt-6">
      <h3 className="text-lg font-bold mb-4">Sample Admit Card Preview</h3>

      <div className="border p-4 bg-white rounded space-y-2">
        <h1 className="text-xl font-bold text-center">{data.heading}</h1>
        <h2 className="text-lg text-center">{data.title}</h2>

        {data.backgroundImage && (
          <img
            src={data.backgroundImage}
            alt="Background"
            className="w-full h-40 object-cover rounded"
          />
        )}

        <p><strong>Exam Name:</strong> {data.examName}</p>
        <p><strong>School Name:</strong> {data.schoolName}</p>
        <p><strong>Exam Center:</strong> {data.examCenter}</p>

        <div className="grid grid-cols-2 gap-2">
          {data.name && <p>Name: _____</p>}
          {data.fatherName && <p>Father Name: _____</p>}
          {data.motherName && <p>Mother Name: _____</p>}
          {data.dob && <p>DOB: _____</p>}
          {data.admissionNo && <p>Admission No: _____</p>}
          {data.rollNo && <p>Roll No: _____</p>}
          {data.address && <p>Address: _____</p>}
          {data.gender && <p>Gender: _____</p>}
          {data.class && <p>Class: _____</p>}
          {data.section && <p>Section: _____</p>}
        </div>

        <p className="mt-4 text-center italic">{data.footerText}</p>
      </div>
    </div>
  );
};

export default SampleAdmitCard;
