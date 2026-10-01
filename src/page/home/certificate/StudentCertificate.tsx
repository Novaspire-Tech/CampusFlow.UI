import React, { useState } from 'react'
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form'
import TextField from '../../../components/controlled/TextField'
import TextAreaField from '../../../components/controlled/TextareaField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import NumberField from '../../../components/controlled/NumberField'
import StudentCertificateTemplate from '../../../templates/StudentCertificateTemplate'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import ToggleButton from '../../../components/controlled/ToggleButton'
import { Label } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { confirmToast } from '../../../helpers/confirmToast'

type CertificateFormData = {
  certificateName: string
  backgroundImage: File | string | null
  headerLeftText: string
  headerCenterText: string
  headerRightText: string
  bodyText: string
  footerLeftText: string
  footerCenterText: string
  footerRightText: string
  headerHeight: string
  footerHeight: string
  bodyHeight: string
  bodyWidth: string
  photoHeight?: string
}

type CertificateRecord = CertificateFormData & {
  id: number
  BGIMG?: string
}

// --- Student Certificate Component ---

export default function StudentCertificate() {
  const [studentPhoto, setStudentPhoto] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [viewCert, setViewCert] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  const [certificateData, setCertificateData] = useState<CertificateRecord[]>([])

  // Translation hooks
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const Page = getPagesNameText(t)

  const methods = useForm<CertificateFormData>({
    defaultValues: {
      certificateName: '',
      headerLeftText: '',
      headerCenterText: '',
      headerRightText: '',
      bodyText: '',
      footerLeftText: '',
      footerCenterText: '',
      footerRightText: '',
      headerHeight: '100',
      footerHeight: '80',
      bodyHeight: '400',
      bodyWidth: '600',
      photoHeight: '120',
      backgroundImage: null,
    },
  })

  const { handleSubmit, control, reset } = methods

  const onSubmit: SubmitHandler<CertificateFormData> = (data) => {
    const imageUrl =
      data.backgroundImage instanceof File
        ? URL.createObjectURL(data.backgroundImage)
        : data.backgroundImage

    const newEntry: CertificateRecord = {
      ...data,
      id: editId ?? Date.now(),
      BGIMG: imageUrl ?? undefined,
      photoHeight: studentPhoto ? data.photoHeight : undefined,
    }

    if (editId) {
      setCertificateData((prev) => prev.map((item) => (item.id === editId ? newEntry : item)))
    } else {
      setCertificateData((prev) => [...prev, newEntry])
    }

    reset()
    setEditId(null)
    setStudentPhoto(false)
  }

  const handleEdit = (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const cert = certificateData.find((item) => item.id === numId)
    if (cert) {
      setEditId(numId)
      reset(cert)
      setStudentPhoto(!!cert.photoHeight)
    }
  }

  const handleDelete = async (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const confirmMessage =
      Text.Do_you_want_to_delete_this_entry || 'Are you sure you want to delete this record?'
    if (await confirmToast(confirmMessage)) {
      setCertificateData((prev) => prev.filter((item) => item.id !== numId))
      if (editId === numId) {
        reset()
        setEditId(null)
        setStudentPhoto(false)
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmMessage =
      Text.Do_you_want_to_delete_this_entry?.replace('${count}', ids.length.toString()) ||
      `Are you sure you want to delete ${ids.length} selected certificate entries?`

    if (await confirmToast(confirmMessage)) {
      setCertificateData((prev) => prev.filter((item) => !ids.includes(item.id)))
      if (editId !== null && ids.includes(editId)) {
        reset()
        setEditId(null)
        setStudentPhoto(false)
      }
    }
  }

  const certificateColumns = [
    { key: 'certificateName', label: 'Certificate Name' },
    {
      key: 'BGIMG',
      label: 'Background Image',
      render: (value: string | undefined) =>
        value ? (
          <img src={value} alt="bg" className="w-12 h-12 object-contain" />
        ) : (
          <div className="w-12 h-12 border flex items-center justify-center text-gray-400">
            <i className="fas fa-image" />
          </div>
        ),
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-white min-h-screen">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">{Page.Student_Certificate}</h2>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField name="certificateName" label="Certificate Name" control={control} required />

            {[
              { field: 'headerLeftText', label: Text.header_Left_Text },
              { field: 'headerCenterText', label: Text.header_Center_Text },
              { field: 'headerRightText', label: Text.header_Right_Text },
              { field: 'footerLeftText', label: Text.footer_Left_Text },
              { field: 'footerCenterText', label: Text.footer_Center_Text },
              { field: 'footerRightText', label: Text.footer_Right_Text },
            ].map(({ field, label }) => (
              <TextField
                key={field}
                name={field as keyof CertificateFormData}
                label={label}
                control={control}
              />
            ))}

            <TextAreaField
              name="bodyText"
              label={Text.Body_Text}
              control={control}
              rows={4}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'headerHeight', label: Text.header_Height },
                { field: 'footerHeight', label: Text.footer_Height },
                { field: 'bodyHeight', label: Text.body_Height },
                { field: 'bodyWidth', label: Text.bodyWidth },
              ].map(({ field, label }) => (
                <NumberField
                  key={field}
                  name={field as keyof CertificateFormData}
                  label={label}
                  control={control}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Label label={Text.Student_Photo} required={false} />
              <div
                className="relative w-12 h-6 rounded-full cursor-pointer"
                onClick={() => setStudentPhoto(!studentPhoto)}
              >
                <ToggleButton name="studentPhotoToggle" control={control} />
              </div>
            </div>

            {studentPhoto && (
              <NumberField name="photoHeight" label={Text.Photo_Height} control={control} />
            )}

            <FileUploadField
              name="backgroundImage"
              label={Text.Upload_Background_Image}
              required
              control={control}
            />

            <div className="pt-4 flex flex-wrap gap-3">
              <Button
                name={editId ? Text.Update : Text.Save}
                loading={false}
                clr="bg-slate-700"
                onClick={handleSubmit(onSubmit)}
                icon={<IconField name="FaSave" />}
              />
              {editId && (
                <Button
                  name={Text.Cancel}
                  loading={false}
                  clr="bg-gray-500"
                  isDisable={false}
                  onClick={() => {
                    reset()
                    setEditId(null)
                    setStudentPhoto(false)
                  }}
                />
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Right Panel - Table */}
      <div className="w-full bg-white rounded shadow sm:mt-8 max-sm:mt-8">
        <ControlledTable
          title={Text.Student_Certificate_List}
          columns={certificateColumns}
          data={certificateData.filter((item) =>
            item.certificateName.toLowerCase().includes(searchTerm.toLowerCase()),
          )}
          searchTerm={searchTerm}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={(id: string | number) => {
            const numId = typeof id === 'string' ? parseInt(id, 10) : id
            setViewCert(numId)
          }}
          actionColumn={true}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={false}
          emptyMessage={Text.No_data_available_in_Table}
        />
      </div>

      {/* Modal View for Template Preview */}
      {viewCert && (
        // Modal Backdrop
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          {/* Modal Content - Template Container */}
          <div
            className="bg-white rounded shadow-2xl max-w-4xl w-full relative"
            style={{ maxWidth: '1160px', maxHeight: '830px' }}
          >
            <button
              onClick={() => setViewCert(null)}
              className="absolute top-2 right-2 text-gray-700 hover:text-black text-3xl font-bold z-10"
            >
              ×
            </button>
            <StudentCertificateTemplate
              {...(certificateData.find((item) => item.id === viewCert) ??
                ({} as CertificateRecord))}
              student={{
                name: '[STUDENT NAME]',
                dob: '[DATE OF BIRTH]',
                present_address: '[ADDRESS]',
                guardian: '[GUARDIAN NAME]',
                created_at: 'YYYY-MM-DD',
                admission_no: '[ADMISSION NO.]',
                roll_no: '[ROLL NO.]',
                gender: '[GENDER]',
                religion: '[RELIGION]',
                cast: '[CASTE]',
                category: '[CATEGORY]',
                phone: '[PHONE NO.]',
                email: '[EMAIL]',
                class: '[CLASS]',
                section: '[SECTION]',
                photo: '',
                admission_date: '[ADMISSION DATE]',
                father_name: "[FATHER'S NAME]",
                mother_name: "[MOTHER'S NAME]",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
