import React, { useState, useRef } from "react";
import Dropdown from "../controlled/Dropdown";
import IconField from "../IconField";
import Button from "../controlled/Button"; 
import { useForm, type Control, type FieldValues } from "react-hook-form";
import { Upload_Modal } from "../../constants/RegexPattern";
import Label from "../Label";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (content: {
    name: string;
    type: string;
    size: string;
    preview: string;
    youtubeLink?: string | null;
  }) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [, setType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, watch } = useForm<FieldValues>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

    const {t} = useTranslation();
  const Uplode_Texrt = getPagesDataText(t);
  const ContentType_Texrt = getPagesDataText(t);
  const Uplode_File_Texrt = getPagesDataText(t);
  const Uplode_Video_Texrt = getPagesDataText(t);
  const Save_Texrt = getPagesDataText(t);

  const handleSave = () => {
    if (!file && !youtubeLink) {
      alert("Please upload a file or provide a YouTube link.");
      return;
    }

    const selectedType = watch("contentType");
    setType(selectedType);

    const isYouTube = !!youtubeLink;
    const youtubeId = youtubeLink ? getYouTubeID(youtubeLink) : null;

    const newContent = {
      name: isYouTube ? "YouTube Video" : file!.name,
      type: isYouTube ? "Video" : selectedType,
      size: isYouTube ? "N/A" : `${(file!.size / 1024).toFixed(2)} KB`,
      preview: isYouTube && youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/0.jpg`
        : URL.createObjectURL(file!),
      youtubeLink: isYouTube ? youtubeLink : null,
    };

    onUpload(newContent);
    onClose();
  };

  const getYouTubeID = (url: string): string | null => {
    const regExp = Upload_Modal;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-blend-color-burn bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white  max-w-4xl w-[90%] rounded shadow-lg relative max-h-screen overflow-y-auto">
        <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center rounded-t">
          <h2 className="text-lg font-semibold ">{Uplode_Texrt.Upload}</h2>
          <button onClick={onClose}>
            <IconField name="FaTimes" size={18} color="#fff" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="w-full">
            <Dropdown
              name="contentType"
              label={ContentType_Texrt.Content_Type}
              control={control as Control<FieldValues>}
              required={true}
              options={["Notes", "Video", "PDF"]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              {/* <label className="block text-sm font-semibold text-black mb-1">
                Upload File
              </label> */}
              <Label label= {Uplode_File_Texrt.Upload_File} required={false}/>
              <div
                className="w-full border rounded px-3 py-2 cursor-pointer flex items-center gap-2 bg-white hover:bg-gray-100"
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length > 0) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <IconField name="FaCloudDownloadAlt" size={20} color="#4B5563" />
                <span className="truncate">
                  {file ? file.name : "Drag and drop file here or click"}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              {/* <label className="block text-sm font-semibold text-black mb-1">
                Upload YouTube Video Link
              </label> */}
              <Label label= {Uplode_Video_Texrt.Upload_YouTube_Video_Link} required={false}/>
              <input
                type="text"
                placeholder="https://youtube.com/..."
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="ml-195">
            <Button
              name={Save_Texrt.Save}
              onClick={handleSave}
              loading={false}
              icon={<IconField name="FaSave" />}

            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
