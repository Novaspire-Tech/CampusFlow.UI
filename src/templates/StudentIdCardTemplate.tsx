import React from "react";

interface CardData {
  BGIMG?: string | Blob;
  logo?: string | Blob;
  heading?: string;
  title?: string;
  footerText?: string;
  sign?: string | Blob;
  DesignType?: boolean;
}

interface IDCardTemplateProps {
  card: CardData;
  studentDetails?: Record<string, any>;
  onClose: () => void;
}

const getImageSrc = (file?: string | Blob): string => {
  if (file instanceof Blob) {
    return URL.createObjectURL(file);
  }
  return file || "";
};

const StudentIdCardTemplate: React.FC<IDCardTemplateProps> = ({
  card,
  studentDetails = {},
  onClose,
}) => {
  const renderStudentDetails = () => (
    <div className="grid grid-cols-2 gap-4 text-lg">
      {Object.entries(studentDetails).map(([key, value]) => {
        if (key === "id") return null;
        return (
          <div key={key} className="flex gap-4">
            <span className="font-semibold w-40">
              {key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase()}
            </span>
            <span className="font-normal">
              {typeof value === "string"
                ? value.toUpperCase()
                : value?.name?.toUpperCase?.() || ""}
            </span>
          </div>
        );
      })}
    </div>
  );

  const layoutClass = card.DesignType ? "w-[520px]" : "w-[900px]";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="w-[90%] bg-white rounded-lg shadow-lg max-h-screen overflow-auto">
        <div className="p-6 flex justify-between items-center border-b">
          <p className="text-xl font-medium">View ID Card</p>
          <button onClick={onClose} className="text-2xl font-bold">
            ×
          </button>
        </div>

        <div
          style={{
            backgroundImage: `url(${getImageSrc(card.BGIMG)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className={`p-6 flex flex-col items-center gap-4 mx-auto rounded-lg shadow-md ${layoutClass}`}
        >
          <img src={getImageSrc(card.logo)} className="h-20 mb-2" alt="Logo" />
          <div className="text-center">
            <p className="text-3xl font-semibold">{card.heading}</p>
            <p className="text-lg underline">{card.title}</p>
          </div>
          <p className="text-center text-xl font-medium underline mt-2">
            May-June 2025 Examinations
          </p>
          <div className="mt-4">{renderStudentDetails()}</div>

          <div className="mt-10">
            {card.sign && (
              <img
                src={getImageSrc(card.sign)}
                alt="Signature"
                className="h-16"
              />
            )}
          </div>
          <p className="text-center mt-4 font-medium text-base">
            {card.footerText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentIdCardTemplate;
