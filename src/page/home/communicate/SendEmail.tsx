import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Dropdown } from "../../../components/controlled";
import TextFields from "../../../components/controlled/TextField";
import TextareaField from "../../../components/controlled/TextareaField";
import FileUploadField from "../../../components/controlled/FileUploadField";
import Button from "../../../components/controlled/Button";
import { Label } from "../../../components";
import { IconField } from "../../../components";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";
import { useTranslation } from "react-i18next";

type ViewType = "card" | "individual" | "Class";

interface FormValues {
  Title: string;
  Body: string;
  Attachment: FileList | null;
  class: string;
  section: string;
  Individualclass: string;
  sendOption: "sendNow" | "schedule";
  // Group checkboxes
  student: boolean;
  guardians: boolean;
  admin: boolean;
  teacher: boolean;
  accountant: boolean;
  librarian: boolean;
  receptionist: boolean;
  superAdmin: boolean;
  multiAdmin: boolean;
  hod: boolean;
}

const SendEmail = () => {
  const [activeView, setActiveView] = useState<ViewType>("card");

  const {
    control,
    handleSubmit,
    reset,
    register,
  } = useForm<FormValues>({
    defaultValues: {
      Title: "",
      Body: "",
      Attachment: null,
      class: "",
      section: "",
      Individualclass: "",
      sendOption: "sendNow",
      student: false,
      guardians: false,
      admin: false,
      teacher: false,
      accountant: false,
      librarian: false,
      receptionist: false,
      superAdmin: false,
      multiAdmin: false,
      hod: false,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form data:", data);
    
    // Process selected recipients for group view
    if (activeView === "card") {
      const selectedRecipients = Object.entries(data)
        .filter(([ value]) => 
          typeof value === "boolean" && value === true
        )
        .map(([key]) => key);
      console.log("Selected Recipients:", selectedRecipients);
    }
    
    // Handle file upload
    if (data.Attachment && data.Attachment.length > 0) {
      console.log("Uploaded file:", data.Attachment[0]);
    }
    
    reset();
  };

  const { t } = useTranslation();
  const SendEmailText = getPagesDataText(t);
  const GroupText = getPagesDataText(t);
  const IndiviualText = getPagesDataText(t);
  const ClassText = getPagesDataText(t);
  const SectionText = getPagesNameText(t);
  const AddText = getPagesDataText(t);
  const SendNowText = getPagesDataText(t);
  const ScheduleText = getPagesDataText(t);
  const SubmitText = getPagesDataText(t);
  const MessageToText = getPagesDataText(t);
  const GrugetText = getPagesDataText(t);
  const AdminText = getPagesDataText(t);
  const TeacherText = getPagesDataText(t);
  const AccountText = getPagesDataText(t);
  const LabrariText = getPagesDataText(t);
  const ReceptionistText = getPagesDataText(t);
  const SuperAminText = getPagesDataText(t);
  const MaultiAdmiText = getPagesDataText(t);
  const HODText = getPagesDataText(t);
  const SearchByStudent = getPagesDataText(t);
  const TitleText = getPagesDataText(t);
  const AttachmentText = getPagesDataText(t);
  const MessageText = getPagesDataText(t);

  return (
    <div className="rounded-md m-2 p-2">
      <div className="border-b-2 px-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-lg md:text-xl font-bold">
            {SendEmailText.Send_Email}
          </h1>
          <div className="flex flex-wrap gap-2">
            {[
              { label: GroupText.Group, value: "card" },
              { label: IndiviualText.Individual, value: "individual" },
              { label: ClassText.Class, value: "Class" },
            ].map((tab) => (
              <div
                key={tab.value}
                onClick={() => setActiveView(tab.value as ViewType)}
                className={`px-4 py-2 cursor-pointer text-sm md:text-base transition rounded-2xl ${
                  activeView === tab.value
                    ? "border-b-4 border-amber-400 font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
        {/* Group View */}
        {activeView === "card" && (
          <div className="lg:flex md:flex w-full justify-between space-x-2">
            {/* Left Side - Email Content */}
            <div className="w-full md:w-[60%]">
              <div className="flex flex-col space-y-4">
                {/* Title Field */}
                <div>
                  <TextFields
                    name="Title"
                    label={TitleText.Title}
                    control={control}
                    placeholder="Enter email title"
                    required
                  />
                </div>

                {/* Body/Message Field */}
                <div>
                  <TextareaField
                    name="Body"
                    label={MessageText.Message || "Message"}
                    control={control}
                    placeholder="Enter your message here..."
                    rows={6}
                    required
                  />
                </div>

                {/* Attachment Field */}
                <div>
                  <FileUploadField
                    name="Attachment"
                    label={"Attachment"}
                    control={control}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Recipients */}
            <div className="w-full md:w-[50%] mt-4 md:mt-0">
              <Label label={MessageToText.Message_To} required={true} />
              <div className="flex flex-col border bg-slate-300 rounded-md p-3 space-y-2">
                {[
                  { name: "student", label: ScheduleText.Student },
                  { name: "guardians", label: GrugetText.Guardians },
                  { name: "admin", label: AdminText.Admin },
                  { name: "teacher", label: TeacherText.Teacher },
                  { name: "accountant", label: AccountText.Accountant },
                  { name: "librarian", label: LabrariText.Librarian },
                  { name: "receptionist", label: ReceptionistText.Receptionist },
                  { name: "superAdmin", label: SuperAminText.Super_Admin },
                  { name: "multiAdmin", label: MaultiAdmiText.Multi_Admin },
                  { name: "hod", label: HODText.HOD },
                ].map((role) => (
                  <div className="flex items-center space-x-2" key={role.name}>
                    <input
                      type="checkbox"
                      {...register(role.name as keyof FormValues)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm">{role.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Individual View */}
        {activeView === "individual" && (
          <div className="flex flex-col md:flex-row w-full justify-between space-x-2">
            {/* Left Side - Email Content */}
            <div className="w-full md:w-[60%]">
              <div className="flex flex-col space-y-4">
                {/* Title Field */}
                <div>
                  <TextFields
                    name="Title"
                    label={TitleText.Title}
                    control={control}
                    placeholder="Enter email title"
                    required
                  />
                </div>

                {/* Body/Message Field */}
                <div>
                  <TextareaField
                    name="Body"
                    label={MessageText.Message || "Message"}
                    control={control}
                    placeholder="Enter your message here..."
                    rows={6}
                    required
                  />
                </div>

                {/* Attachment Field */}
                <div>
                  <FileUploadField
                    name="Attachment"
                    label={AttachmentText.document || AttachmentText.Documen || "Attachment"}
                    control={control}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Individual Selection */}
            <div className="w-full md:w-[50%] space-y-2 shadow-xl rounded-lg p-4 mt-4 md:mt-0">
              <Label label="Message To" required={true} />
              <div className="flex justify-between items-center gap-2">
                <Dropdown
                  label={ClassText.Class}
                  name="Individualclass"
                  control={control}
                  required={true}
                  options={["1st", "2nd", "3rd", "4th", "5th"]}
                />
                <div className="mt-5">
                  <Button
                    name={AddText.Add}
                    loading={false}
                    onClick={() => {
                      console.log("Add student clicked");
                    }}
                  />
                </div>
              </div>
              <div className="bg-slate-400 rounded-xl p-4 min-h-[200px]">
                <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 w-full">
                  <input
                    type="text"
                    placeholder={SearchByStudent.Search_By_Student_Name}
                    className="bg-white text-black rounded-full px-3 py-1 w-full focus:outline-none"
                  />
                  <IconField name="FaSearch" className="text-gray-600 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class View */}
        {activeView === "Class" && (
          <div className="flex flex-col md:flex-row w-full justify-between space-x-2">
            {/* Left Side - Email Content */}
            <div className="w-full md:w-[60%]">
              <div className="flex flex-col space-y-4">
                {/* Title Field */}
                <div>
                  <TextFields
                    name="Title"
                    label={TitleText.Title}
                    control={control}
                    placeholder="Enter email title"
                    required
                  />
                </div>

                {/* Body/Message Field */}
                <div>
                  <TextareaField
                    name="Body"
                    label={MessageText.Message || "Message"}
                    control={control}
                    placeholder="Enter your message here..."
                    rows={6}
                    required
                  />
                </div>

                {/* Attachment Field */}
                <div>
                  <FileUploadField
                    name="Attachment"
                    label={ "Attachment"}
                    control={control}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Class Selection */}
            <div className="w-full md:w-[50%] shadow-xl rounded-lg p-4 mt-4 md:mt-0">
              <Label label="Message To" required={true} />
              <Dropdown
                label={ClassText.Class}
                name="class"
                control={control}
                required={true}
                options={[
                  "1st",
                  "2nd",
                  "3rd",
                  "4th",
                  "5th",
                  "SSLC",
                  "PUC 1ST",
                  "PUC 2ST",
                ]}
              />
              <TextareaField
                name="section"
                label={SectionText.Section}
                control={control}
                placeholder="Write something..."
                rows={5}
              />
            </div>
          </div>
        )}

        {/* Submit Section */}
        <div className="mt-4 gap-4 flex flex-col md:flex-row justify-end items-center">
          <div className="flex gap-4">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                value="sendNow"
                {...register("sendOption")}
                defaultChecked
              />
              <span>{SendNowText.Send_Now}</span>
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                value="schedule"
                {...register("sendOption")}
              />
              <span>{ScheduleText.Schedule}</span>
            </label>
          </div>
          <Button
            name={SubmitText.Submit}
            loading={false}
            icon={<IconField name="FaSave" />}
          />
        </div>
      </form>
    </div>
  );
};

export default SendEmail;