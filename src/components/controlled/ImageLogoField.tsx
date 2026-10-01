import React, { useState } from 'react';
import Error from './Error';
import  Button  from './Button';
import { FiSave } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getPagesDataText } from '../../helpers/useTranslations';
 
interface ImageLogoFieldProps {
  heading: string;
  required?: boolean;
}
 
const ImageLogoField: React.FC<ImageLogoFieldProps> = ({
  heading,
  required = false,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImage(result);
          setError('');
        }
      };
      fileReader.readAsDataURL(file);
    }
  };
 
  const handleSubmit = () => {
    if (required && !image) {
      setError(`${heading} is required`);
    } else {
      setError('');
      alert('Submitted!');
    }
  };
 
  const {t} = useTranslation();
  const UpadetText = getPagesDataText(t);
  const ImagePriveText = getPagesDataText(t);
 
  return (
    <div className="border border-gray-400 shadow-lg rounded-md">
      <div className="md:m-3 sm:m-3 m-4 border-b-1 flex items-center gap-1">
        <h2 className="font-medium md:text-1xl pb-3 sm:text-xl">
          {heading} {required && <span className="text-red-500">*</span>}
        </h2>
      </div>
 
      <div>
        <img
          className="w-full md:h-50 sm:h-25 h-40 object-contain"
          src={image || ''}
          alt={ImagePriveText.Image_Preview}
        />
        <input
          onChange={handleChange}
          type="file"
          accept="image/*"
          className="md:px-3 px-2 md:py-5 sm:py-5 py-6 font-medium w-full"
        />
      </div>
 
        {error &&
            <Error error={{ message: error }}
            />}
 
      <div className="flex justify-end mr-1 -mt-1 mb-1">
         <Button
            name={UpadetText.Update}
            loading={false}
            onClick={handleSubmit}
            isDisable={false}
            icon={<FiSave/>}
          />
      </div>
    </div>
  );
};
 
export default ImageLogoField;
 
 