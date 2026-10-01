import React from 'react';
import  Button  from '../controlled/Button';
import IconField from '../IconField';
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";
 
 
type LoginCardProps = {
  title: string;
  background: string;
  upload: string;  
  click: () => void;
};
 
const LoginCard: React.FC<LoginCardProps> = ({ title, background, click }) => {
 
  const {t} = useTranslation();
  const UpalodText = getPagesDataText(t);
  return (
    <div>
      <div>
        <div className="relative border border-gray-400 rounded-sm inset-shadow-sm inset-shadow-indigo-300 w-auto p-3 m-3">
          <div>
            <p className="font-medium mb-3 text-2xl">{title}</p>
            <hr />
          </div>
 
          <img className="w-97.5 h-34.25 mt-4 mb-25" src={background} alt="bg_1" />
 
          <div className="absolute right-4 bottom-4">
              <Button
            name={UpalodText.Upload}
            loading={false}
            isDisable={false}
            icon={<IconField name="FaSave"/>}
 
            onClick={click}
          />
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default LoginCard;
 
 