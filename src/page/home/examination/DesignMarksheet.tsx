import React, { useMemo } from 'react'
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form'
import { toast } from 'react-toastify'
import TextField from '../../../components/controlled/TextField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import Button from '../../../components/controlled/Button'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { Dropdown } from '../../../components/controlled'
import ToggleButton from '../../../components/controlled/ToggleButton'
import { confirmToast } from '../../../helpers/confirmToast'

import {
  useGetAllMarksheetTemplates,
  useAddMarksheetTemplate,
  useDeleteMarksheetTemplate,
  useViewMarkSheetTemplate,
  useDownloadMarkSheetTemplate,
} from '../../../hooks/queries/examination/useDesignMarksheet'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useExamGroupsByClass } from '../../../hooks/queries/examination/useExamGroup'

// Types
import type { MarkSheetTemplateFormData } from '../../../types/examination/DesignMarksheet'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

const DesignMarksheet: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  // Queries
  const { data: templates = [], isLoading } = useGetAllMarksheetTemplates()
  const { data: classesData } = useSchoolClasses()

  const addMutation = useAddMarksheetTemplate()
  const deleteMutation = useDeleteMarksheetTemplate()
  const viewMutation = useViewMarkSheetTemplate()
  const downloadMutation = useDownloadMarkSheetTemplate()

  // Form Setup
  const methods = useForm<MarkSheetTemplateFormData>({
    defaultValues: {
      templateName: '',
      schoolName: '',
      address: '',
      session: '',
      logo: null,
      principleSign: null,
      schoolClassId: 0,
      examGroupId: 0,
      fatherName: true,
      motherName: false,
      admissionNo: true,
      dateOfBirth: true,
      sign: true,
      stamp: false,
    },
  })

  const { control, handleSubmit, reset, watch, setValue } = methods

  const watchClassId = watch('schoolClassId')
  const watchFatherName = watch('fatherName')
  const watchMotherName = watch('motherName')

  React.useEffect(() => {
    if (watchFatherName && watchMotherName) {
      setValue('fatherName', false, { shouldDirty: true })
    }
  }, [watchMotherName, watchFatherName, setValue])

  React.useEffect(() => {
    if (watchMotherName && watchFatherName) {
      setValue('motherName', false, { shouldDirty: true })
    }
  }, [watchFatherName, watchMotherName, setValue])

  const { data: examGroupsByClass = [] } = useExamGroupsByClass(
    watchClassId && watchClassId > 0 ? Number(watchClassId) : undefined,
  )

  React.useEffect(() => {
    if (watchClassId && examGroupsByClass.length > 0) {
      const firstExamGroup = examGroupsByClass[0]
      if (firstExamGroup) {
        setValue('examGroupId', firstExamGroup.examGroupId || firstExamGroup.id, {
          shouldDirty: true,
        })
      }
    }
  }, [watchClassId, examGroupsByClass, setValue])

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: Number(c.id || c.schoolClassId),
      })) || [],
    [classesData],
  )

  const examGroupOptions = useMemo(
    () =>
      examGroupsByClass?.map((eg: any) => ({
        label: eg.examGroupName || eg.name,
        value: Number(eg.examGroupId || eg.id),
      })) || [],
    [examGroupsByClass],
  )

  const onSaveTemplate: SubmitHandler<MarkSheetTemplateFormData> = async (data) => {
    try {
      if (!data.schoolClassId || data.schoolClassId === 0) {
        toast.error('Please select a class')
        return
      }
      if (!data.logo) {
        toast.error('Logo is required')
        return
      }

      const submitData: MarkSheetTemplateFormData = {
        ...data,
        schoolClassId: Number(data.schoolClassId),
        examGroupId: Number(data.examGroupId),
        admissionNo: true,
        dateOfBirth: true,
      }

      await addMutation.mutateAsync(submitData)
      toast.success('Template Created Successfully!')
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Error saving template')
    }
  }

  const handleView = async (id: string | number) => {
    try {
      const templateId = typeof id === 'string' ? parseInt(id) : id
      const blob = await viewMutation.mutateAsync(templateId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 100)
      toast.success('Opening template preview...')
    } catch (error: any) {
      toast.error(error.message || 'Error viewing template')
    }
  }

  const handleDownload = async (id: string | number) => {
    try {
      const templateId = typeof id === 'string' ? parseInt(id) : id
      const blob = await downloadMutation.mutateAsync(templateId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `marksheet_template_${templateId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)
      toast.success('Template downloaded successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Error downloading template')
    }
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast('Are you sure you want to delete this template?')
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Template deleted successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Error deleting template')
      }
    }
  }

  const tableData = useMemo(() => {
    return templates.map((template) => ({
      id: template.marksSheetTemplateId,
      templateName: template.templateName,
      schoolName: template.schoolName,
      session: template.session,
    }))
  }, [templates])

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 font-medium text-slate-500">
        Loading Templates...
      </div>
    )
  }

  function r(): void {
    reset()
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-400 mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {Text.Design_Marksheet || 'Design Marksheet'}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-5 rounded-xl shadow-md h-fit sticky top-6">
              <h2 className="text-lg font-bold mb-4 text-slate-700">
                {Text.Template_Settings || 'Template Settings'}
              </h2>

              <FormProvider {...methods}>
                <AllSchoolDropdown
                  onSubmit={handleSubmit(onSaveTemplate)}
                  queryKeys={['markSheet', 'schoolClasses', 'examGroups']}
                  onSchoolChange={r}
                >
                  <TextField
                    name="templateName"
                    label={Text.Template_Name || 'Template Name'}
                    control={control}
                    placeholder={Text.Enter_Template_Name || 'Enter Template Name'}
                    required
                  />
                  <TextField
                    name="schoolName"
                    label={Text.School_Name || 'School Name'}
                    control={control}
                    placeholder={Text.Enter_School_Name || 'Enter School Name'}
                    required
                  />
                  <TextField
                    name="address"
                    label={Text.Address || 'Address'}
                    control={control}
                    placeholder={Text.Enter_School_Address || 'Enter School Address'}
                    required
                  />
                  <TextField
                    name="session"
                    label={Text.Session || 'Session'}
                    control={control}
                    required
                    placeholder="e.g., 2024-2025"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Dropdown
                      name="schoolClassId"
                      label={Text.Class || 'Class'}
                      control={control}
                      options={classOptions}
                      required
                    />
                    <Dropdown
                      name="examGroupId"
                      label={Text.Exam_Group || 'Exam Group'}
                      control={control}
                      options={examGroupOptions}
                      required
                    />
                  </div>

                  <FileUploadField
                    name="logo"
                    label={Text.Logo || 'Logo'}
                    control={control}
                    required
                  />
                  <FileUploadField
                    name="principleSign"
                    label={Text.Principal_Sign || 'Principal Sign'}
                    control={control}
                  />

                  <div className="space-y-2 border-t pt-4">
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Student Fields</h3>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-slate-700">
                          {Text.Father_Name || "Father's Name"}
                        </span>
                        <ToggleButton name="fatherName" control={control} />
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-slate-700">
                          {Text.Mother_Name || "Mother's Name"}
                        </span>
                        <ToggleButton name="motherName" control={control} />
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 mt-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-slate-600">
                          {Text.Admission_No || 'Admission No.'}
                        </span>
                        <ToggleButton name="admissionNo" control={control} />
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-slate-600">
                          {Text.Date_Of_Birth || 'Date of Birth'}
                        </span>
                        <ToggleButton name="dateOfBirth" control={control} />
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-600 mt-4 mb-2">
                      {Text.Display_Options || 'Display Options'}
                    </h3>
                    <div className="flex justify-between items-center py-1 px-1">
                      <span className="text-sm font-medium text-slate-700">
                        {Text.Principal_Signature || 'Principal Signature'}
                      </span>
                      <ToggleButton name="sign" control={control} />
                    </div>
                    <div className="flex justify-between items-center py-1 px-1">
                      <span className="text-sm font-medium text-slate-700">
                        {Text.School_Stamp || 'School Stamp'}
                      </span>
                      <ToggleButton name="stamp" control={control} />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                      name={Text.Save || 'Save'}
                      clr="bg-slate-800"
                      onClick={handleSubmit(onSaveTemplate)}
                      loading={addMutation.isPending}
                    />
                  </div>
                </AllSchoolDropdown>
              </FormProvider>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <ControlledTable
                title={Text.Templates || 'Template List'}
                columns={[
                  { key: 'templateName', label: Text.Template_Name || 'Template Name' },
                  { key: 'schoolName', label: Text.School_Name || 'School Name' },
                ]}
                data={tableData}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
                actionColumn
                showSelectAll={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignMarksheet
