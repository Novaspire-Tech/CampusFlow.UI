import React from "react";
 
interface Student {
  studentName: string;
  admissionNo: string;
  class: string;
  fatherName: string;
  mobile: string;
  dob: string;
}
 
interface IDCardTemplateProps {
  student: Student;
}
 
const GenerateIdCardTemplate: React.FC<IDCardTemplateProps> = ({ student }) => (
  <div
    style={{
      width: "350px",
      height: "220px",
      border: "2px solid #8B0000",
      borderRadius: "12px",
      margin: "40px auto",
      padding: "16px 18px",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      position: "relative"
    }}
  >
    <div style={{ width: 90, textAlign: "center" }}>
      <img
        src="https://i.imgur.com/6VBx3io.png"
        alt="Student"
        style={{
          width: 60,
          height: 60,
          borderRadius: "8px",
          border: "2px solid #8B0000",
          marginBottom: 10,
          objectFit: "cover"
        }}
      />
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?data=${student.admissionNo}&size=60x60`}
        alt="QR"
        style={{ width: 60, height: 60, margin: "0 auto" }}
      />
    </div>
 
   
    <div style={{ flex: 1, marginLeft: 18 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <img
          src="https://i.imgur.com/7b1p5Lw.png"
          alt="Logo"
          style={{ width: 32, height: 32, marginRight: 6 }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#8B0000", lineHeight: 1 }}>
            Mount Carmel School
          </div>
          <div style={{ fontSize: 9, color: "#444" }}>
            110 Kings Street, CA<br />
            Ph: 456542 | mount@gmail.com
          </div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#888", fontWeight: 600, margin: "2px 0 8px" }}>
        SAMPLE STUDENT IDENTITY CARD HORIZONTAL
      </div>
      <table style={{ fontSize: 12, width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, width: 70 }}>Name</td>
            <td>: {student.studentName}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Adm No</td>
            <td>: {student.admissionNo}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Class</td>
            <td>: {student.class}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Father</td>
            <td>: {student.fatherName}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Mobile</td>
            <td>: {student.mobile}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>D.O.B</td>
            <td>: {student.dob}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Blood Grp</td>
            <td>: __________</td>
          </tr>
        </tbody>
      </table>
     
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 22,
          opacity: 0.4,
          fontSize: 18,
          fontFamily: "cursive"
        }}
      >
        Signature
      </div>
    </div>
  </div>
);
 
export default GenerateIdCardTemplate;