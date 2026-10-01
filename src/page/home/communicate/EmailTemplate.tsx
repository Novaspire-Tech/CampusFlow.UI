import { useEffect, useState, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import TextField from "../../../components/controlled/TextField";
import TextAreaField from "../../../components/controlled/TextareaField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { Label } from "../../../components";
import { IconField } from "../../../components";
import { getPagesDataText } from "../../../helpers/useTranslations";
import { useTranslation } from "react-i18next";



interface EmailTemplate {
  id: number;
  title: string;
  message: string;
  attachment?: File | null;
}

interface FormValues {
  title: string;
  message: string;
  attachment: File | null;
}

const EmailTemplateList = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]); 
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); 

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      title: "",
      message: "",
      attachment: null,
    },
  });

  useEffect(() => {
    if (editId !== null) {
      const template = templates.find((t) => t.id === editId);
      if (template) {
        setValue("title", template.title);
        setValue("message", template.message);
        setAttachmentName(template.attachment?.name || "");
      }
    } else {
      reset();
      setAttachmentName(""); 
    }
  }, [editId, templates, setValue, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setLoading(true);

    setTimeout(() => {
      if (editId !== null) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === editId ? { ...t, ...data } : t))
        );
      } else {
        const newItem: EmailTemplate = { id: Date.now(), ...data };
        setTemplates((prev) => [newItem, ...prev]);
      }

      reset(); 
      setEditId(null); 
      setShowForm(false); 
      setAttachmentName(""); 
      setLoading(false);
    }, 800); 
  };

  const handleEdit = (id: string | number) => {
    setShowForm(true); 
    setEditId(Number(id)); 
  };

  const handleDelete = (id: string | number) => {
    const confirmDelete = window.confirm(
      DeletText.Do_you_want_to_delete_this_entry
    );
    if (!confirmDelete) return; 

    
    setTemplates((prev) => prev.filter((t) => t.id !== Number(id)));

   
    if (editId === Number(id)) {
      setEditId(null);
      reset();
      setAttachmentName("");
      setShowForm(false); 
    }
  };


  const handleDeleteMultiple = (ids: (string | number)[]) => {
    const numericIdsToDelete = ids.map((id) =>
      typeof id === "string" ? parseInt(id, 10) : id
    );

    const confirmDelete = window.confirm(
      DeletAllText.Delete_A
    );
    if (!confirmDelete) return;    
    setTemplates((prevTemplates) =>
      prevTemplates.filter((template) => !numericIdsToDelete.includes(template.id))
    );
    if (editId !== null && numericIdsToDelete.includes(editId)) {
      setEditId(null);
      reset();
      setAttachmentName("");
      setShowForm(false); 
    }
  };
 
  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.message.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("attachment", file);
      setAttachmentName(file.name);
    }
  };

  const {t} = useTranslation();
  const EmailTempaletListText = getPagesDataText(t);
  const AddText = getPagesDataText(t);
  const AddEmailTempaletText = getPagesDataText(t);
  const EditEmailTempaleText = getPagesDataText(t);
  const TitleText = getPagesDataText(t);
  const MessageText = getPagesDataText(t);
  const AttachmenText = getPagesDataText(t);
  const SaveText = getPagesDataText(t);
  const UpadetaText = getPagesDataText(t);
  const DeletText = getPagesDataText(t);
  const DeletAllText = getPagesDataText(t);
 

   const columns = [
    { key: "title", label: TitleText.Title },
    { key: "message", label: MessageText.Message },
  ];


  return (
    <div className="relative p-4 w-full">
      <div className="overflow-x-auto">
        <ControlledTable
          title={EmailTempaletListText.Email_Template}
          columns={columns}
          data={filteredTemplates}
          searchTerm={searchTerm}
          onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple} 
          btn={true}
          btnName={AddText.Add}
          showForm={() => {
            reset();
            setEditId(null);
            setShowForm(true);
            setAttachmentName(""); 
          }}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
              onClick={() => {
                reset();
                setEditId(null);
                setShowForm(false);
                setAttachmentName("");
              }}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">
              {editId ? EditEmailTempaleText.Edit_Template : AddEmailTempaletText.Add_Email_Template}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <TextField
                name="title"
                label={TitleText.Title}
                control={control}
                placeholder="Enter title"
                required={true}
              />
              <div>
                {/* <label className="text-sm font-medium mb-1 block">
                  Attachment
                </label> */}
                <Label label= {AttachmenText.Attach_Document} required={false}/>

                <div
                  className="border-2 border-gray-400 rounded p-4 text-center cursor-pointer hover:border-gray-600"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    name="attachment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-gray-500 text-sm truncate">
                    {attachmentName || "Drag and drop a file here or click"}
                  </p>
                </div>
              </div>
              <TextAreaField
                name="message"
                label="Message"
                control={control}
                placeholder="Enter message"
              />
              <div className="flex justify-end mt-2">
                <Button
                  name={editId ? UpadetaText.Update : SaveText.Save}
                  loading={loading}
                  isDisable={false}
                  icon={<IconField name="FaSave" />}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateList;