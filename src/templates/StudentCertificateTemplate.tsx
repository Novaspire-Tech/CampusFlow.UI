import React from "react";
 
interface Student {
  name: string;
  dob: string;
  present_address: string;
  guardian: string;
  created_at: string;
  admission_no: string;
  roll_no: string;
  class: string;
  section: string;
  gender: string;
  admission_date: string;
  category: string;
  cast: string;
  father_name: string;
  mother_name: string;
  religion: string;
  email: string;
  phone: string;
  photo?: string;
}
 
interface CertificateConfig {
  certificateName: string;
  BGIMG?: string;
  headerLeftText: string;
  headerCenterText: string;
  headerRightText: string;
  bodyText: string;
  footerLeftText: string;
  footerCenterText: string;
  footerRightText: string;
  headerHeight: string;
  footerHeight: string;
  bodyHeight: string;
  bodyWidth: string;
  photoHeight?: string;
}
 
interface CertificateTemplateProps extends CertificateConfig {
  student: Student;
}
 
const StudentCertificateTemplate: React.FC<CertificateTemplateProps> = (
  props
) => {
  const {
    student,
    certificateName,
    BGIMG,
    headerLeftText,
    headerCenterText,
    headerRightText,
    bodyText,
    footerLeftText,
    footerCenterText,
    footerRightText,
    photoHeight,
    headerHeight,
    footerHeight,
    bodyHeight,
    bodyWidth,
  } = props;
 
  const getFormattedBodyText = (text: string, studentData: Student) => {
    let formattedText = text;
    formattedText = formattedText.replace(
      /\[name\]/g,
      `**${studentData.name}**`
    );
    formattedText = formattedText.replace(/\[dob\]/g, `**${studentData.dob}**`);
    formattedText = formattedText.replace(
      /\[admission\_no\]/g,
      `**${studentData.admission_no}**`
    );
    formattedText = formattedText.replace(
      /\[class\]/g,
      `**${studentData.class}**`
    );
    formattedText = formattedText.replace(
      /\[section\]/g,
      `**${studentData.section}**`
    );
    formattedText = formattedText.replace(
      /\[father\_name\]/g,
      `**${studentData.father_name}**`
    );
    formattedText = formattedText.replace(
      /\[mother\_name\]/g,
      `**${studentData.mother_name}**`
    );
    const withBreaks = formattedText.replace(/\n/g, "<br/>");
    const withBold = withBreaks.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    return withBold;
  };
 
  return (
    <div className="relative w-[1120px] h-[790px] mx-auto my-0 p-0 border border-gray-300 overflow-hidden text-[#1f2937]">
      {BGIMG && (
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${BGIMG})`,
              filter: "blur(3px)",
              transform: "scale(1.02)",
            }}
          />
 
          <div className="absolute inset-0 bg-black opacity-10" />
        </div>
      )}
 
      <div className="relative z-10 p-10 bg-transparent h-full">
        <div className="text-center mb-7">
          <h1 className="text-[28px] text-gray-800 underline m-0 font-extrabold">
            {certificateName || "Untitled Certificate"}
          </h1>
        </div>
 
        {/* HEADER */}
        <div
          className={`flex justify-between text-[16px] min-h-[${headerHeight}px] border-b border-gray-300 pb-2`}
        >
          <div className="text-left">{headerLeftText}</div>
          <div className="text-center font-bold">{headerCenterText}</div>
          <div className="text-right">{headerRightText}</div>
        </div>
 
        {/* BODY */}
        <div
          className={`text-left mt-7 text-[18px] leading-[1.8] min-h-[${bodyHeight}px] w-[${bodyWidth}px] mx-auto py-2`}
          dangerouslySetInnerHTML={{
            __html: getFormattedBodyText(bodyText, student),
          }}
        />
 
        {/* PHOTO */}
        {photoHeight && photoHeight !== "0" && (
          <div className="flex justify-center mt-5">
            <img
              src={
                student.photo ||
                "https://via.placeholder.com/100x120?text=Student+Photo"
              }
              alt="Student"
              className="w-[100px] border border-gray-400 object-cover shadow-md"
              style={{ height: `${photoHeight}px`, objectFit: "cover" }}
            />
          </div>
        )}
 
        {/* FOOTER */}
        <div
          className={`flex justify-around mt-20 text-[14px] min-h-[${footerHeight}px] border-t border-gray-300 pt-2`}
        >
          <div className="text-center">
            .................................
            <br />
            {footerLeftText}
          </div>
          <div className="text-center">
            .................................
            <br />
            {footerCenterText}
          </div>
          <div className="text-center">
            .................................
            <br />
            {footerRightText}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default StudentCertificateTemplate;
 