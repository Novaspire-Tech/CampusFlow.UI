import React from 'react';
import DropDown from '../controlled/Dropdown';
import TextFields from '../controlled/TextField';
import  NumberField  from '../controlled/NumberField';
import TextAreaField from '../controlled/TextareaField';
import { useTranslation } from 'react-i18next';
import { getPagesDataText } from '../../helpers/useTranslations';
 
interface SmsContentProps {
  control: any;
}

 
const SmsContent: React.FC<SmsContentProps> = ({ control }) => {

  const {t} = useTranslation();
const Email_Template_Text = getPagesDataText(t);
const Title_Text = getPagesDataText(t);
const Send_Through_Text = getPagesDataText(t);
const SMS_Text = getPagesDataText(t);
const MobileApp_Text = getPagesDataText(t);
const Tamleate_ID_Text = getPagesDataText(t);
const Description_Text = getPagesDataText(t);

  return (
    <>
      <div className="flex flex-col">
        <div>
          <DropDown
            label={Email_Template_Text.Email_Template}
            name="emailTemplate"
            control={control}
            required={true}
            options={["Good Morning All the Best for Your Exam"]}
          />
          <TextFields name="Title" label={Title_Text.Title} control={control} />
          <div className="flex  justify-center items-center gap-5">
            <h1>
              {Send_Through_Text.Send_Through} <span className="text-red-500 ">*</span>
            </h1>
            <div className='grid grid-cols-1 sm:grid-cols-2'>
            <label className="cursor-pointer">
              <input type="radio" name="send" value="SMS" />
              <span>{SMS_Text.SMS}</span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="send" value="Mobileapp" />
              <span>{MobileApp_Text.Mobile_App}</span>
            </label>
          </div>
          </div>
 
          <NumberField
            name="Template"
            control={control}
            label={Tamleate_ID_Text.Template}
          />
          <TextAreaField
            name="Description"
            label={Description_Text.Description}
            control={control}
            placeholder="Write something..."
            rows={4}
          />
        </div>
      </div>
    </>
  );
};
 
export default SmsContent;
 
 