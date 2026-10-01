import React, { useState, useEffect, useMemo } from 'react'
import { useForm, FormProvider, type SubmitHandler, useWatch } from 'react-hook-form'

import { Dropdown } from '../../../components/controlled'
import TextField from '../../../components/controlled/TextField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import ToggleButton from '../../../components/controlled/ToggleButton'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField, Label } from '../../../components'
import { toast } from 'react-toastify'

import {
  useAdmitCardTemplates,
  useCreateAdmitCardTemplate,
  useDeleteAdmitCardTemplate,
  useViewAdmitCardInNewTab,
  useDownloadAdmitCard,
  useAdmitCardTemplatesByClassAndExam,
} from '../../../hooks/queries/examination/usedesignAdmitCard'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
// import { useSections } from "../../../hooks/queries/academics/useSections";
import { useExamGroupsByClass } from '../../../hooks/queries/examination/useExamGroup'
import { useStudents } from '../../../hooks/queries/studentInformation/useStudents'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

interface AdmitCardFormData {
  templateName: string
  schoolName: string
  address: string
  logo: File | string | null
  principleSign: File | string | null

  fatherName: boolean
  motherName: boolean
  admissionNo: boolean
  dateOfBirth: boolean
  sign: boolean

  schoolClassId: number | string
  examGroupId: number | string
}

interface Student {
  id: string | number
  studentId: string | number
  admissionNo: string
  rollNo: number
  firstName?: string
  middleName?: string
  lastName?: string
  studentName: string
  gender: string
  dob: string
  classId?: string | number
  class: string
  className?: string
  sectionId?: string | number
  section: string
  sectionName?: string
  mobileNumber: string
  fatherName: string
  motherName?: string
  parentPhone: string
  address: string
  photo?: string
  uid: string
}

interface SearchFormValues {
  class: string
  section: string
  examGroup: string
  templateId: string
}

const DesignAdmitCard: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  // const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'designer' | 'generator'>('designer')
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // React Query hooks
  const { data: templates = [], isLoading: isLoadingTemplates } = useAdmitCardTemplates()
  const createMutation = useCreateAdmitCardTemplate()
  const deleteMutation = useDeleteAdmitCardTemplate()
  const viewInNewTabMutation = useViewAdmitCardInNewTab()
  const downloadMutation = useDownloadAdmitCard()

  const { data: classes = [] } = useSchoolClasses()
  // const { data: examGroups = [] } = useExamGroups();

  const [page] = useState(0)
  const [size] = useState(1000)
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(page, size, 'asc')

  const designerMethods = useForm<AdmitCardFormData>({
    defaultValues: {
      templateName: '',
      schoolName: '',
      address: '',
      logo: null,
      principleSign: null,
      motherName: false,
      fatherName: false,
      admissionNo: false,
      dateOfBirth: false,
      sign: false,
      schoolClassId: '',
      examGroupId: '',
    },
  })

  const searchMethods = useForm<SearchFormValues>()
  const designerPreview = useWatch({ control: designerMethods.control })
  // const selectedFormClass = useWatch({ control: designerMethods.control, name: "schoolClassId" });

  const selectedSearchClass = useWatch({ control: searchMethods.control, name: 'class' })
  const selectedSearchExamGroup = useWatch({ control: searchMethods.control, name: 'examGroup' })

  // Get sections for the selected class in generator search
  // const { data: searchSectionsData = [] } = useSections(
  //   selectedSearchClass ? Number(selectedSearchClass) : 0
  // );

  // Get filtered templates by class and exam group in generator
  const { data: filteredTemplates = [] } = useAdmitCardTemplatesByClassAndExam(
    selectedSearchClass ? Number(selectedSearchClass) : undefined,
    selectedSearchExamGroup ? Number(selectedSearchExamGroup) : undefined,
  )

  const { watch, setValue } = designerMethods

  const watchClassId = watch('schoolClassId')
  const classIdNumber = Number(watchClassId)

  const { data: examGroupsByClass = [] } = useExamGroupsByClass(
    watchClassId && classIdNumber > 0 ? Number(watchClassId) : undefined,
  )
  // Auto-select first exam group when class changes
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
      classes?.map((c: any) => ({
        label: c.name || c.className,
        value: Number(c.id || c.schoolClassId),
      })) || [],
    [classes],
  )

  const examGroupOptions = useMemo(
    () =>
      examGroupsByClass?.map((eg: any) => ({
        label: eg.examGroupName || eg.name,
        value: Number(eg.examGroupId || eg.id),
      })) || [],
    [examGroupsByClass],
  )
  const { data: searchExamGroupsByClass = [] } = useExamGroupsByClass(
    selectedSearchClass ? Number(selectedSearchClass) : undefined,
  )

  const searchExamGroupOptions = useMemo(
    () =>
      searchExamGroupsByClass?.map((eg: any) => ({
        label: eg.examGroupName || eg.name,
        value: Number(eg.examGroupId || eg.id),
      })) || [],
    [searchExamGroupsByClass],
  )

  // Clear section when class changes in generator
  useEffect(() => {
    if (selectedSearchClass) {
      searchMethods.setValue('section', '')
    }
  }, [selectedSearchClass, searchMethods])

  // Clear template when class or exam group changes
  useEffect(() => {
    searchMethods.setValue('templateId', '')
  }, [selectedSearchClass, selectedSearchExamGroup, searchMethods])

  const onSaveTemplate: SubmitHandler<AdmitCardFormData> = async (formData) => {
    try {
      const payload = {
        data: {
          templateName: formData.templateName,
          schoolName: formData.schoolName,
          address: formData.address,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          admissionNo: formData.admissionNo,
          dateOfBirth: formData.dateOfBirth,
          sign: formData.sign,
          schoolClassId: Number(formData.schoolClassId),
          examGroupId: Number(formData.examGroupId),
        },
        logo: formData.logo instanceof File ? formData.logo : undefined,
        principleSign: formData.principleSign instanceof File ? formData.principleSign : undefined,
      }

      await createMutation.mutateAsync(payload as any)
      toast.success('Template saved successfully!')
      designerMethods.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteMutation.mutateAsync(templateId)
        toast.success('Template deleted successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete template')
      }
    }
  }

  const handleViewTemplate = async (templateId: string) => {
    try {
      await viewInNewTabMutation.mutateAsync(templateId)
      toast.success('Opening template in new tab...')
    } catch (error: any) {
      toast.error(error.message || 'Failed to view template')
    }
  }

  // const handleDownloadTemplate = async (templateId: string) => {
  //   try {
  //     const template = templates.find((t) => t.id === templateId);
  //     const filename = template?.templateName
  //       ? `${template.templateName.replace(/\s+/g, '_')}.pdf`
  //       : `admit_card_${templateId}.pdf`;

  //     await downloadMutation.mutateAsync({ templateId, filename });
  //     toast.success("Template downloaded successfully!");
  //   } catch (error: any) {
  //     toast.error(error.message || "Failed to download template");
  //   }
  // };

  const handleSearchStudents = (formData: SearchFormValues) => {
    if (!studentsData?.students) {
      toast.error('No students data available')
      return
    }

    // Transform and filter students based on class and section
    const transformedStudents = studentsData.students
      .filter((student: any) => {
        const matchClass = !formData.class || String(student.classId) === String(formData.class)
        const matchSection =
          !formData.section || String(student.sectionId) === String(formData.section)
        return matchClass && matchSection
      })
      .map((student: any) => ({
        id: student.studentId?.toString() || student.id?.toString(),
        studentId: student.studentId?.toString() || student.id?.toString(),
        admissionNo: student.admissionNo || '',
        rollNo: student.rollNo || 0,
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        lastName: student.lastName || '',
        studentName:
          `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim(),
        gender: student.gender || '',
        dob: student.dob || '',
        classId: student.classId,
        class: student.className || student.class || '',
        className: student.className,
        sectionId: student.sectionId,
        section: student.sectionName || student.section || '',
        sectionName: student.sectionName,
        mobileNumber: student.phoneNumber || student.mobileNumber || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        parentPhone: student.parentPhone || '',
        address: student.currentAddress || student.address || '',
        photo: student.photo || '',
        uid: student.uid || '',
      }))

    setFilteredStudents(transformedStudents)
    setSelectedIds([]) // Reset selected IDs when new search is performed

    if (transformedStudents.length === 0) {
      toast.info('No students found for the selected class and section')
    } else {
      toast.success(`Found ${transformedStudents.length} student(s)`)
    }
  }

  const handleGenerateCards = async () => {
    const templateId = searchMethods.getValues('templateId')

    if (!templateId) {
      return toast.error('Please select a template')
    }

    if (selectedIds.length === 0) {
      return toast.error('Please select at least one student')
    }

    // Download the admit card for selected students
    try {
      const blob = await downloadMutation.mutateAsync({
        templateId,
        selectedIds,
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `student_admit_cards_${new Date().getTime()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)

      toast.success(`Admit card generated for ${selectedIds.length} student(s)`)

      setSelectedIds([])
    } catch (error: any) {
      toast.error(error.message || 'Failed to download admit cards')
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Revoke any object URLs created for preview
      if (designerPreview.logo && designerPreview.logo instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(designerPreview.logo))
      }
      if (designerPreview.principleSign && designerPreview.principleSign instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(designerPreview.principleSign))
      }
    }
  }, [designerPreview.logo, designerPreview.principleSign])

  function re(): void {
    designerMethods.reset()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">
          {currentView === 'designer'
            ? Text.Design_Admit_Card || 'Design Admit Card'
            : Text.Generate_Admit_Cards || 'Generate Admit Cards'}
        </h1>
        <Button
          loading={false}
          showAlways
          name={
            currentView === 'designer'
              ? Text.Generate_Admit_Cards || 'Generate Admit Card'
              : Text.Back_To_Designer || 'Back to Designer'
          }
          onClick={() => {
            setCurrentView(currentView === 'designer' ? 'generator' : 'designer')
            setFilteredStudents([])
            setSelectedIds([])
          }}
          icon={<IconField name={currentView === 'designer' ? 'FaArrowRight' : 'FaArrowLeft'} />}
        />
      </div>

      {currentView === 'designer' ? (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
          {/* FORM SIDE */}
          <div className="w-full lg:w-1/3 bg-white p-5 rounded-xl shadow-sm max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
              {Text.Admit_Card_Template || 'Admit Card Template'}
            </h2>
            <FormProvider {...designerMethods}>
              <AllSchoolDropdown
                onSubmit={designerMethods.handleSubmit(onSaveTemplate)}
                queryKeys={['admitCardTemplates', 'schoolClasses', 'examGroups', 'students']}
                onSchoolChange={re}
              >
                <div className="grid grid-cols-1 gap-4">
                  <TextField
                    name="templateName"
                    label={Text.Template_Name || 'Template Name'}
                    control={designerMethods.control}
                    placeholder={Text.Enter_Template_Name || 'Enter Template Name'}
                    required
                  />
                  <TextField
                    name="schoolName"
                    label={Text.School_Name || 'School Name'}
                    control={designerMethods.control}
                    placeholder={Text.Enter_School_Name || 'Enter School Name'}
                    required
                  />
                  <TextField
                    name="address"
                    label={Text.School_Address || 'School Address'}
                    control={designerMethods.control}
                    placeholder={Text.Enter_School_Address || 'Enter School Address'}
                    required
                  />

                  <Dropdown
                    name="schoolClassId"
                    label={Text.Select_Class || 'Select Class'}
                    control={designerMethods.control}
                    options={classOptions}
                    required
                  />

                  <Dropdown
                    name="examGroupId"
                    label={Text.Exam_Group || ' Exam Group'}
                    control={designerMethods.control}
                    options={examGroupOptions}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FileUploadField
                    name="logo"
                    label={Text.School_Logo || 'Logo'}
                    control={designerMethods.control}
                    required
                  />
                  <FileUploadField
                    name="principleSign"
                    label={Text.Principal_Sign || 'Principal Signature'}
                    control={designerMethods.control}
                  />
                </div>

                <div className="p-4 rounded-lg">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">
                    {Text.Field_Visibility_Toggles || 'Field Visibility Toggles'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'motherName', label: Text.Mother_Name || "Mother's Name" },
                      { id: 'fatherName', label: Text.Father_Name || "Father's Name" },
                      { id: 'admissionNo', label: Text.Admission_No || 'Admission No.' },
                      { id: 'dateOfBirth', label: Text.Date_Of_Birth || 'Date of Birth' },
                      { id: 'sign', label: Text.Principal_Sign || 'Principal Signature' },
                    ].map((toggle) => (
                      <div
                        key={toggle.id}
                        className="flex justify-between items-center py-1 border-b border-blue-100 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
                        <ToggleButton name={toggle.id as any} control={designerMethods.control} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  name={Text.Save_Template || 'Save Templates'}
                  icon={<IconField name="FaSave" />}
                  loading={createMutation.isPending}
                />
              </AllSchoolDropdown>
            </FormProvider>
          </div>

          <div className="lg:w-2/3 space-y-6">
            <ControlledTable
              title={Text.Saved_Templates || 'Saved Templates'}
              columns={
                [
                  {
                    key: 'templateName',
                    label: Text.Template_Name || 'Template Name',
                  },
                  {
                    key: 'schoolName',
                    label: Text.School_Name || 'School Name',
                  },
                  {
                    key: 'address',
                    label: Text.School_Address || 'School Address',
                  },
                ] as any
              }
              data={templates}
              onDelete={(id) => handleDeleteTemplate(id as string)}
              onView={(id) => handleViewTemplate(id as string)}
              actionColumn={true}
              loading={isLoadingTemplates}
            />
          </div>
        </div>
      ) : (
        /* GENERATOR VIEW */
        <div className="p-4 space-y-6">
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <form
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              onSubmit={searchMethods.handleSubmit(handleSearchStudents)}
            >
              <Dropdown
                label={Text.Class || ' Class'}
                name="class"
                control={searchMethods.control}
                options={classOptions}
                required
              />

              <Dropdown
                label={Text.Exam_Group || ' Exam Group'}
                name="examGroup"
                control={searchMethods.control}
                options={searchExamGroupOptions}
                required
              />

              {selectedSearchClass && selectedSearchExamGroup ? (
                <Dropdown
                  label={Text.Template || 'Select Template'}
                  name="templateId"
                  control={searchMethods.control}
                  options={filteredTemplates.map((t) => ({ label: t.templateName, value: t.id! }))}
                  required
                />
              ) : (
                <div>
                  <Label label={Text.Template || 'Template'} />
                  <select
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  >
                    <option value="">
                      {Text.Select_Class_And_Exam_Group_First ||
                        'Select Class and Exam Group First'}
                    </option>
                  </select>
                </div>
              )}

              <div className="md:col-span-4 flex justify-end">
                <Button
                  type="submit"
                  name={Text.Search_Student || 'Search Students'}
                  loading={isLoadingStudents}
                  icon={<IconField name="FaSearch" />}
                />
              </div>
            </form>
          </div>

          {filteredStudents.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Student List ({selectedIds.length} selected)</h3>
                <Button
                  name={Text.Generate_Selected_Cards || 'Generate Selected Cards'}
                  isDisable={selectedIds.length === 0 || !searchMethods.getValues('templateId')}
                  onClick={handleGenerateCards}
                  loading={downloadMutation.isPending}
                  icon={<IconField name="FaDownload" />}
                />
              </div>
              <ControlledTable
                columns={
                  [
                    {
                      key: 'id',
                      label: Text.Select || 'Select',
                      render: (_: any, item: Student) => (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(Number(item.id))}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(Number(item.id))
                                ? prev.filter((i) => i !== Number(item.id))
                                : [...prev, Number(item.id)],
                            )
                          }
                        />
                      ),
                    },
                    {
                      key: 'rollNo',
                      label: Text.Roll_No || 'Roll No',
                    },
                    {
                      key: 'studentName',
                      label: Text.Name || 'Name',
                    },
                    {
                      key: 'admissionNo',
                      label: Text.Admission_No || 'Admission No',
                    },
                    {
                      key: 'class',
                      label: Text.Class || 'Class',
                    },
                    {
                      key: 'section',
                      label: Text.Section_Name || 'Section',
                    },
                    {
                      key: 'fatherName',
                      label: Text.Father_Name || "Father's Name",
                    },
                    {
                      key: 'motherName',
                      label: Text.Mother_Name || "Mother's Name",
                    },
                    {
                      key: 'dob',
                      label: Text.Date_Of_Birth || 'Date of Birth',
                    },
                    {
                      key: 'gender',
                      label: Text.Gender || 'Gender',
                    },
                  ] as any
                }
                data={filteredStudents}
                actionColumn={false}
                enablePermissions={true}
                showSelectAll={false}
                permissionScope="ADMIT_CARD"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DesignAdmitCard
