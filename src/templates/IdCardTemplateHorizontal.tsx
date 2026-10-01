import React from "react";

interface StaffData {
  staffName: string;
  staffId: string;
  fatherName: string;
  motherName: string;
  dateOfJoining: string;
  address: string;
  mobile: string;
  dob: string;
}

interface IdCardTemplateHorizontalProps {
  data: StaffData;
}

const IdCardTemplateHorizontal: React.FC<IdCardTemplateHorizontalProps> = ({ data }) => {
  console.log(data);

  return (
    <>
      <h1>Horizontal</h1>
      <div
        style={{
          width: "280px",
          margin: "50px auto",
          padding: "40px",
          fontFamily: "'Times New Roman', serif",
          border: "1px solid #ccc",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        
        <div style={{ textAlign: "center" }}>
          <p style={{ marginTop: "5px", fontSize: "14px" }}>
            23, Kings Street, CA, Phone: 0916-6766-144
          </p>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "30px",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginTop: "40px", fontSize: "14px" }}>
              <div>_________________</div>
              <div>Principal</div>
            </div>
          </div>

  
          <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
            <p>
              Staff Name: <strong>{data.staffName}</strong>
            </p>
            <p>
              Staff ID: <strong>{data.staffId}</strong>
            </p>
            <p>
              Father's Name: <strong>{data.fatherName}</strong>
            </p>
            <p>
              Mother's Name: <strong>{data.motherName}</strong>
            </p>
            <p>
              Date of Joining: <strong>{data.dateOfJoining}</strong>
            </p>
            <p>
              Address: <strong>{data.address}</strong>
            </p>
            <p>
              Phone: <strong>{data.mobile}</strong>
            </p>
            <p>
              Date of Birth: <strong>{data.dob}</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default IdCardTemplateHorizontal;
