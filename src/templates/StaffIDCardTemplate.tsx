import React from "react";

interface FileOrString {
  name?: string;
  toUpperCase?: () => string;
}

interface StaffDetails {
  [key: string]: string | FileOrString | number;
}

interface FormData {
  staffDetails?: StaffDetails;
}

interface CardData {
  BGIMG?: string | Blob;
  logo?: string | Blob;
  signature?: string | Blob;
  title?: string;
  designType?: boolean;
}

interface StaffIDCardTemplateProps {
  cardData: CardData;
  formData: FormData;
  onClose: () => void;
}

const getImageSrc = (file?: string | Blob): string => {
  if (file instanceof Blob) {
    return URL.createObjectURL(file);
  }
  return file || "";
};

const StaffIDCardTemplate: React.FC<StaffIDCardTemplateProps> = ({
  cardData,
  formData,
  onClose,
}) => {
  const details = Object.entries(formData.staffDetails || {}).filter(
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
            : typeof value === "object" && value !== null && "name" in value && typeof (value as any).name === "string"
            ? ((value as any).name as string).toUpperCase()
            : ""}
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
    <div className="fixed inset-0 z-40 flex justify-center items-center bg-gray-200 bg-opacity-50 backdrop-blur-sm p-4">
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

  if (cardData.designType) {
   
    return (
      <CardLayout widthClass="w-[900px]">
        <div className="flex justify-between items-center mb-4">
          <img src={getImageSrc(cardData.logo)} className="h-20" alt="Logo" />
          <div className="text-center">
            <p className="text-2xl font-bold">{cardData.title}</p>
          </div>
          <img src={getImageSrc(cardData.logo)} className="h-20" alt="Logo" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {renderDetails()}
        </div>
        {cardData.signature && (
          <div className="flex justify-end mt-8">
            <img
              src={getImageSrc(cardData.signature)}
              alt="Signature"
              className="h-16"
            />
          </div>
        )}
      </CardLayout>
    );
  }

  return (
    <CardLayout widthClass="w-[400px] text-center">
      <img
        src={getImageSrc(cardData.logo)}
        className="h-20 mx-auto mb-4"
        alt="Logo"
      />
      <p className="text-2xl font-bold mb-4">{cardData.title}</p>
      <div className="text-left mx-auto w-fit text-sm">
        {renderDetails()}
      </div>
      {cardData.signature && (
        <div className="flex justify-end mt-8">
          <img
            src={getImageSrc(cardData.signature)}
            alt="Signature"
            className="h-16"
          />
        </div>
      )}
    </CardLayout>
  );
};

export default StaffIDCardTemplate;
