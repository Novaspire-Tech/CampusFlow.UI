import React from "react";
import type Student from "../page/home/systemSettinds/users/Student";

interface FileOrString {
  name?: string;
  toUpperCase?: () => string;
}

interface StudentDetails {
  [key: string]: string | FileOrString;
}

interface FormData {
  studentDetails?: StudentDetails;
}

interface CardData {
  BGIMG?: string | Blob;
  logo?: string | Blob;
  sign?: string | Blob;
  title?: string;
  DesignType?: boolean;
}

interface IDCardTemplateProps {
  cardData: CardData;
  formData: FormData;
  student: Student;
  onClose: () => void;
}

const getImageSrc = (file?: string | Blob): string => {
  if (file instanceof Blob) {
    return URL.createObjectURL(file);
  }
  return file || "";
};

const IDCardTemplate: React.FC<IDCardTemplateProps> = ({ cardData, formData, onClose }) => {
  const details = Object.entries(formData.studentDetails || {}).filter(
    ([key]) => key !== "id"
  );

  const renderDetails = () =>
    details.map(([key, value]) => (
      <div key={key} className="flex gap-4 text-sm mb-1">
        <span className="font-semibold w-32">
          {key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase()}
        </span>
        <span className="font-normal">
          {typeof value === "string"
            ? value.toUpperCase()
            : value?.name?.toUpperCase?.() || ""}
        </span>
      </div>
    ));

  const baseStyles =
    "relative p-8 bg-cover bg-center bg-no-repeat rounded-lg shadow-inner text-black backdrop-blur-md";

  const backgroundImageStyle = {
    backgroundImage: `url(${getImageSrc(cardData.BGIMG)})`,
  };

  const CardLayout: React.FC<{ children: React.ReactNode; widthClass?: string }> = ({
    children,
    widthClass = "w-auto",
  }) => (
    <div className="fixed inset-0 z-40 flex justify-center items-center bg-gray-300 bg-opacity-40 backdrop-blur-sm p-4">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onClose}
          className="text-3xl font-bold text-gray-700 hover:text-black"
        >
          &times;
        </button>
      </div>
      <div
        style={backgroundImageStyle}
        className={`${baseStyles} ${widthClass}`}
      >
        {children}
      </div>
    </div>
  );

  if (cardData.DesignType) {
    return (
      <CardLayout widthClass="w-[400px] text-center">
        <img
          src={getImageSrc(cardData.logo)}
          className="h-20 mx-auto mb-4"
          alt="Logo"
        />
        <p className="text-2xl font-bold mb-4">{cardData.title}</p>
        <div className="text-left mx-auto w-fit text-sm">{renderDetails()}</div>
        {cardData.sign && (
          <div className="flex justify-end mt-8">
            <img
              src={getImageSrc(cardData.sign)}
              alt="Signature"
              className="h-16"
            />
          </div>
        )}
      </CardLayout>
    );
  }

  return (
    <CardLayout widthClass="w-[900px]">
      <div className="text-center mb-4">
        <img
          src={getImageSrc(cardData.logo)}
          className="h-20 mx-auto"
          alt="Logo"
        />
        <p className="text-2xl font-bold mt-2">{cardData.title}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {renderDetails()}
      </div>
      {cardData.sign && (
        <div className="flex justify-end mt-8">
          <img
            src={getImageSrc(cardData.sign)}
            alt="Signature"
            className="h-16"
          />
        </div>
      )}
    </CardLayout>
  );
};

export default IDCardTemplate;
