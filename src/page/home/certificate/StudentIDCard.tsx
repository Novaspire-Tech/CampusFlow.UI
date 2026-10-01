import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useForm, FormProvider, type SubmitHandler, useWatch } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextField from '../../../components/controlled/TextField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import ToggleButton from '../../../components/controlled/ToggleButton'
import Button from '../../../components/controlled/Button'
import Dropdown from '../../../components/controlled/Dropdown'
import { IconField } from '../../../components'

import {
  useStudentIdCardTemplates,
  useCreateStudentIdCardTemplate,
  useDeleteStudentIdCardTemplate,
  useViewStudentIdCardTemplate,
  useGenerateStudentIdCards,
} from '../../../hooks/queries/certificate/usestudentIdCard'

import type {
  StudentIdCardTemplateFormData,
  GenerateStudentIdCardsDto,
  Student,
} from '../../../types/certificate/studentIdCard'

import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { studentService } from '../../../services/studentInformation/studentService'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import UniversalTextField from '../../../components/controlled/UniversalTextField'

type CardRow = {
  id: string
  templateName: string
  schoolName: string
  address: string
}

type SearchFormValues = {
  studentClass: string
  section: string
  templateId: string
}

type StudentWithPhoto = Student & {
  id: number
  studentId: number
  photoUrl?: string
  photoBlob?: Blob | null
  photoError?: boolean
}

const DEFAULT_FORM_VALUES: StudentIdCardTemplateFormData = {
  templateName: 'ID CARD',
  schoolName: '',
  tagLine: '',
  address: '',
  logo: null,
  sign: null,
  backgroundImage: null,
  backCardBackgroundImage: null,
  name: true,
  photo: true,
  admissionNo: false,
  dateOfBirth: false,
  classField: false,
  section: false,
  signature: true,
  fatherName: false,
  parentPhone: false,
  gender: false,
  studentAddress: false,
  bloodGroup: false,
  circularProfilePicture: false,
  headerBodyDividerLine: false,
  headerTextColor: '#1e3a5f',
  keyTextColor: '#374151',
  valueTextColor: '#111827',
}
const useStudentPhotos = (students: Student[]) => {
  const [studentsWithPhotos, setStudentsWithPhotos] = useState<StudentWithPhoto[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  const isFetchingRef = useRef(false)
  const objectUrlsRef = useRef<string[]>([])

  const studentsKey = useMemo(
    () => (students.length === 0 ? 'empty' : students.map((s) => s.studentId).join(',')),
    [students],
  )

  useEffect(() => {
    const fetchPhotos = async () => {
      if (isFetchingRef.current) return
      if (!students || students.length === 0) {
        setStudentsWithPhotos([])
        return
      }
      console.log('Fetching photos...')

      isFetchingRef.current = true
      setLoadingPhotos(true)

      const results = await Promise.all(
        students.map(async (student) => {
          const studentId =
            typeof student.studentId === 'number'
              ? student.studentId
              : parseInt(String(student.studentId), 10)

          if (!student.photo?.trim()) {
            return {
              ...student,
              id: studentId,
              studentId,
              photoUrl: undefined,
              photoBlob: null,
              photoError: false,
            } as StudentWithPhoto
          }

          try {
            const blob = await studentService.getProfilePicture(student.photo)
            if (!blob || blob.size === 0) throw new Error('Empty blob')
            const photoUrl = URL.createObjectURL(blob)
            objectUrlsRef.current.push(photoUrl)
            return {
              ...student,
              id: studentId,
              studentId,
              photoUrl,
              photoBlob: blob,
              photoError: false,
            } as StudentWithPhoto
          } catch {
            return {
              ...student,
              id: studentId,
              studentId,
              photoUrl: undefined,
              photoBlob: null,
              photoError: true,
            } as StudentWithPhoto
          }
        }),
      )

      setStudentsWithPhotos(results)
      setLoadingPhotos(false)
      isFetchingRef.current = false
    }

    fetchPhotos()

    return () => {
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch {}
      })
      objectUrlsRef.current = []
    }
  }, [studentsKey])

  return { studentsWithPhotos, loadingPhotos }
}
const ErrorBanner: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
    <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 p-4 shadow-lg rounded-r-lg">
      <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-red-700 font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-red-400 hover:text-red-600">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
)

const SuccessBanner: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => (
  <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
    <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-500 p-4 shadow-lg rounded-r-lg">
      <svg
        className="h-5 w-5 text-green-500 shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-green-700 font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-green-400 hover:text-green-600">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
)

const ColorPickerRow: React.FC<{
  label: string
  fieldName: 'headerTextColor' | 'keyTextColor' | 'valueTextColor'
  methods: ReturnType<typeof useForm<StudentIdCardTemplateFormData>>
}> = ({ label, fieldName, methods }) => (
  <div className="flex justify-between items-center py-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        className="h-8 w-10 rounded cursor-pointer border border-gray-300 p-0.5"
        {...methods.register(fieldName)}
      />
      <span className="text-xs text-gray-400 w-16 font-mono">
        {methods.watch(fieldName) || '#000000'}
      </span>
    </div>
  </div>
)

const ToggleRow: React.FC<{
  label: string
  name: keyof StudentIdCardTemplateFormData
  control: ReturnType<typeof useForm<StudentIdCardTemplateFormData>>['control']
}> = ({ label, name, control }) => (
  <div className="flex justify-between items-center">
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <ToggleButton name={name} control={control} />
  </div>
)

const PhotoCell: React.FC<{ student: StudentWithPhoto; loading: boolean }> = ({
  student,
  loading,
}) => {
  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
  }
  if (student.photoUrl) {
    return (
      <img
        src={student.photoUrl}
        alt={student.studentName}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
      />
    )
  }
  if (student.photoError) {

    return (
      <div
        className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
        title="Photo failed to load"
      >
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
      title="No photo"
    >
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  )
}

const StudentIDCardManager: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const { data: templates = [], isLoading: templatesLoading } = useStudentIdCardTemplates()
  const createTemplate = useCreateStudentIdCardTemplate()
  const deleteTemplate = useDeleteStudentIdCardTemplate()
  const viewTemplate = useViewStudentIdCardTemplate()
  const generateIdCards = useGenerateStudentIdCards()

  const designerMethods = useForm<StudentIdCardTemplateFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onSubmit',
  })

  const searchMethods = useForm<SearchFormValues>()
  const selectedClass = useWatch({ control: searchMethods.control, name: 'studentClass' })
  const { data: classesData } = useSchoolClasses()
  const { data: sectionsData } = useSections(Number(selectedClass) || 0)

  const [currentView, setCurrentView] = useState<'designer' | 'generator'>('designer')
  const [students, setStudents] = useState<Student[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingCards, setGeneratingCards] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { studentsWithPhotos, loadingPhotos } = useStudentPhotos(students)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(t)
  }, [error])

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(null), 3000)
    return () => clearTimeout(t)
  }, [success])

  const tableData: CardRow[] = useMemo(
    () =>
      templates.map((t, i) => ({
        id: t.studentIdCardTemplateId?.toString() ?? t.id?.toString() ?? `temp_${Date.now()}_${i}`,
        templateName: t.templateName || 'Untitled Template',
        schoolName: t.schoolName || '',
        address: t.address || '',
      })),
    [templates],
  )

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: c.id?.toString() || c.classId?.toString(),
      })) ?? [],
    [classesData],
  )

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((s: any) => ({
        label: s.name || s.sectionName,
        value: s.id?.toString() || s.sectionId?.toString(),
      })) ?? [],
    [sectionsData],
  )

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentsWithPhotos
    const q = searchTerm.toLowerCase()
    return studentsWithPhotos.filter((s) => Object.values(s).join(' ').toLowerCase().includes(q))
  }, [studentsWithPhotos, searchTerm])

  const onSaveTemplate: SubmitHandler<StudentIdCardTemplateFormData> = async (data) => {
    if (!data.logo) {
      setError('Logo is required')
      return
    }
    try {
      setError(null)
      setSuccess('Saving template…')
      await createTemplate.mutateAsync(data)
      designerMethods.reset(DEFAULT_FORM_VALUES)
      setSuccess('Template saved successfully!')
    } catch (e: any) {
      setError(e.message || 'Failed to save template')
    }
  }

  const onDeleteTemplate = async (id: string | number | undefined) => {
    if (!id) {
      setError('No template ID found')
      return
    }
    if (!window.confirm('Delete this template?')) return
    try {
      await deleteTemplate.mutateAsync(id.toString())
      setSuccess('Template deleted.')
    } catch (e: any) {
      setError(e.message || 'Failed to delete template')
    }
  }

const onPreviewTemplate = async (id: string | number | undefined) => {
  if (!id) {
    setError('No template ID')
    return
  }

  const newTab = window.open('', '_blank')

  if (!newTab) {
    setError('Popup blocked. Please allow popups for this site and try again.')
    return
  }

  newTab.document.write(
    '<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#555;">Generating preview…</body></html>'
  )

  try {
    const blob = await viewTemplate.mutateAsync(id.toString())
    const url = URL.createObjectURL(blob)
    newTab.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (e: any) {
    newTab.close()
    setError(e.message || 'Failed to preview template')
  }
}

  const onSearchSubmit: SubmitHandler<SearchFormValues> = async (fd) => {
    if (!fd.studentClass) {
      setError('Please select a class')
      return
    }
    setStudentsLoading(true)
    setError(null)
    try {
      const params: any = { schoolClassId: Number(fd.studentClass) }
      if (fd.section) params.sectionId = Number(fd.section)

      const result = await studentService.search(params, 0, 100_000, 'admissionNo', 'asc')
      const fetched = result.students || []

      if (fetched.length === 0) setError('No students found.')

      const mapped: Student[] = fetched.map((s: any) => {
        const studentId =
          typeof s.studentId === 'number' ? s.studentId : parseInt(String(s.studentId), 10)
        return {
          studentId,
          admissionNo: s.admissionNo || s.admissionNumber || '',
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          studentName:
            s.studentName ||
            `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
            s.admissionNo ||
            '',
          class: s.class || s.className || '',
          className: s.className || s.class || '',
          section: s.section || s.sectionName || '',
          sectionName: s.sectionName || s.section || '',
          dob: s.dob || s.dateOfBirth || '',
          rollNumber: s.rollNo || s.rollNumber || '',
          photo: s.photo || '',
          photoUrl: s.photoUrl || '',
        } as Student
      })

      setStudents(mapped)
      setHasSearched(true)
      setSelectedIds([])
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch students')
      setStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleGenerateIDCards = async () => {
    const selectedTemplateId = searchMethods.getValues('templateId')
    if (!tableData.find((t) => t.id === selectedTemplateId)) {
      setError('Please select a template first')
      return
    }
    if (selectedIds.length === 0) {
      setError('Please select at least one student')
      return
    }

    setGeneratingCards(true)
    setError(null)

    try {
      const dto: GenerateStudentIdCardsDto = { studentIds: selectedIds }
      const blob = await generateIdCards.mutateAsync({ templateId: selectedTemplateId, dto })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student_id_cards_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)

      setSuccess(`${selectedIds.length} ID card(s) generated and downloaded!`)
      setSelectedIds([])
    } catch (e: any) {
      setError(e.message || 'Failed to generate ID cards')
    } finally {
      setGeneratingCards(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      {success && <SuccessBanner message={success} onClose={() => setSuccess(null)} />}

      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">
          {currentView === 'designer'
            ? Text.Student_ID_Card_Template_Designer
            : Text.Generate_ID_Cards}
        </h1>
        <Button
          loading={false}
          name={currentView === 'designer' ? Text.Generate_ID_Cards : Text.Back_To_Designer}
          onClick={() => {
            setCurrentView((v) => (v === 'designer' ? 'generator' : 'designer'))
            setError(null)
            setSuccess(null)
          }}
          icon={<IconField name={currentView === 'designer' ? 'FaArrowRight' : 'FaArrowLeft'} />}
          showAlways
        />
      </div>

      {currentView === 'designer' ? (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
          <div className="w-full lg:w-1/3 bg-white p-5 rounded-xl border shadow-sm max-h-[85vh] overflow-y-auto">
            <FormProvider {...designerMethods}>
              <AllSchoolDropdown
                onSubmit={designerMethods.handleSubmit(onSaveTemplate)}
                className="space-y-4"
                queryKeys={['studentIdCard', 'schoolClasses', 'sections']}
              >
                <TextField
                  name="templateName"
                  label={Text.Template_Name || 'Template Name'}
                  control={designerMethods.control}
                  required
                />
                <TextField
                  name="schoolName"
                  label={Text.Institution_Name || 'Institution Name'}
                  placeholder="Eg.ABC INTERNATIONAL SCHOOL"
                  control={designerMethods.control}
                  required
                />

                <UniversalTextField
                  name="tagLine"
                  label={Text.Tag_Line || 'Tag Line'}
                  placeholder="Eg.Engineering and Technology"
                  control={designerMethods.control}
                />


                <TextField
                  name="address"
                  label={Text.Address || 'Address'}
                  placeholder="Enter address"
                  control={designerMethods.control}
                  required
                />
                
                <FileUploadField
                  name="logo"
                  label={Text.Logo_Image || 'Logo Image'}
                  control={designerMethods.control}
                  required
                  accept="image/*"
                />
                <FileUploadField
                  name="sign"
                  label={Text.Principal_Signature || 'Principal Signature'}
                  control={designerMethods.control}
                  accept="image/*"
                />
                <FileUploadField
                  name="backgroundImage"
                  label={Text.Front_Card_Background || 'Front Card Background'}
                  control={designerMethods.control}
                  accept="image/*"
                />
                <FileUploadField
                  name="backCardBackgroundImage"
                  label={Text.Back_Card_Background_optional || 'Back Card Background (optional)'}
                  control={designerMethods.control}
                  accept="image/*"
                />

                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {Text.Colours}
                  </p>
                  <ColorPickerRow
                    label={Text.Header_text || 'Header Text'}
                    fieldName="headerTextColor"
                    methods={designerMethods}
                  />
                  <ColorPickerRow
                    label={Text.Key_text || 'Key Text'}
                    fieldName="keyTextColor"
                    methods={designerMethods}
                  />
                  <ColorPickerRow
                    label={Text.Value_text || 'Value Text'}
                    fieldName="valueTextColor"
                    methods={designerMethods}
                  />
                </div>

                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {Text.Visible_Fields || 'Visible Fields'}
                  </p>

                  <p className="text-xs font-semibold text-gray-400 uppercase mt-1">Core</p>
                  <ToggleRow
                    label={Text.Student_Name || 'Student Name'}
                    name="name"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Photo || 'Photo'}
                    name="photo"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Principal_Signature || 'Principal Signature'}
                    name="signature"
                    control={designerMethods.control}
                  />

                  <hr className="border-gray-200" />

                  <p className="text-xs font-semibold text-gray-400 uppercase mt-1">
                    {Text.Academic}
                  </p>
                  <ToggleRow
                    label={Text.Admission_No || 'Admission No.'}
                    name="admissionNo"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Class || 'Class'}
                    name="classField"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Section || 'Section'}
                    name="section"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Date_Of_Birth || 'Date of Birth'}
                    name="dateOfBirth"
                    control={designerMethods.control}
                  />

                  <hr className="border-gray-200" />

                  <p className="text-xs font-semibold text-gray-400 uppercase mt-1">
                    {Text.Personal}
                  </p>
                  <ToggleRow
                    label={Text.Father_Name || 'Father Name'}
                    name="fatherName"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Phone || 'Phone'}
                    name="parentPhone"
                    control={designerMethods.control}
                  />
                  {/* <ToggleRow label="Gender" name="gender" control={designerMethods.control} /> */}
                  <ToggleRow
                    label={Text.Student_Address || 'Student Address'}
                    name="studentAddress"
                    control={designerMethods.control}
                  />
                  {/* <ToggleRow
                    label="Blood Group"
                    name="bloodGroup"
                    control={designerMethods.control}
                  /> */}

                  <hr className="border-gray-200" />

                  <p className="text-xs font-semibold text-gray-400 uppercase mt-1">
                    {Text.Layout}
                  </p>
                  <ToggleRow
                    label={Text.Circular_Profile_Picture || 'Circular Profile Picture'}
                    name="circularProfilePicture"
                    control={designerMethods.control}
                  />
                  <ToggleRow
                    label={Text.Header_Body_Divider || 'Header Body Divider'}
                    name="headerBodyDividerLine"
                    control={designerMethods.control}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    name={createTemplate.isPending ? 'Saving…' : Text.Save_Template}
                    loading={createTemplate.isPending}
                    icon={<IconField name="FaSave" />}
                    type="submit"
                  />
                </div>
              </AllSchoolDropdown>
            </FormProvider>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {Text.Saved_Templates || 'Saved Templates'}
              </h2>

              {templatesLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
                  Loading templates…
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-400">No templates yet. Create your first one!</p>
                </div>
              ) : (
                <ControlledTable
                  columns={[
                    { key: 'templateName', label: Text.Template_Name || 'Template Name' },
                    { key: 'schoolName', label: Text.Institution_Name || 'Institution Name' },
                    { key: 'address', label: Text.Address || 'Address' },
                  ]}
                  data={tableData}
                  onDelete={(id) => onDeleteTemplate(id)}
                  onView={(id) => onPreviewTemplate(id)}
                  actionColumn
                  showSelectAll={false}
                  loading={false}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Search criteria */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {Text.Select_Criteria || 'Select Criteria'}
            </h2>
            <AllSchoolDropdown
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4"
              queryKeys={['sections', 'schoolClasses', 'studentIdCard']}
              onSubmit={searchMethods.handleSubmit(onSearchSubmit)}
            >
              <Dropdown
                label={Text.Class || 'Class'}
                name="studentClass"
                control={searchMethods.control}
                options={classOptions}
                required
              />
              <Dropdown
                label={Text.Section || 'Section'}
                name="section"
                control={searchMethods.control}
                options={sectionOptions}
              />
              <Dropdown
                label={Text.ID_Card_Template || 'ID Card Template'}
                name="templateId"
                control={searchMethods.control}
                options={tableData.map((t) => ({ label: t.templateName, value: t.id }))}
                required
              />
              <div className="sm:col-span-3 flex justify-end">
                <Button
                  name={Text.Search_Student || 'Search Students'}
                  type="submit"
                  icon={<IconField name="FaSearch" />}
                  loading={studentsLoading}
                  showAlways
                />
              </div>
            </AllSchoolDropdown>
          </div>

          {/* Student list */}
          {hasSearched && (
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {Text.Student_List || 'Student List'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}{' '}
                    found
                    {selectedIds.length > 0 && ` · ${selectedIds.length} selected`}
                  </p>
                  {loadingPhotos && (
                    <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading photos…
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedIds.length > 0 && (
                    <Button
                      loading={generatingCards}
                      name={
                        generatingCards
                          ? 'Generating…'
                          : Text.Download_ZIP || `Download ZIP (${selectedIds.length})`
                      }
                      onClick={handleGenerateIDCards}
                      icon={<IconField name="FaPrint" />}
                      showAlways
                    />
                  )}
                  <Button
                    loading={false}
                    name={
                      selectedIds.length === filteredStudents.length && filteredStudents.length > 0
                        ? 'Deselect All'
                        : Text.Select_All || 'Select All'
                    }
                    onClick={() =>
                      setSelectedIds(
                        selectedIds.length === filteredStudents.length &&
                          filteredStudents.length > 0
                          ? []
                          : filteredStudents.map((s) => s.studentId),
                      )
                    }
                    showAlways
                  />
                </div>
              </div>

              {studentsLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
                  Loading students…
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <p className="text-gray-400">No students match the selected criteria.</p>
                </div>
              ) : (
                <ControlledTable<StudentWithPhoto>
                  columns={[
                    {
                      key: 'id',
                      label: 'Select',
                      render: (_: any, item: StudentWithPhoto) => (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.studentId)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.studentId)
                                ? prev.filter((i) => i !== item.studentId)
                                : [...prev, item.studentId],
                            )
                          }
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      ),
                    },
                    { key: 'admissionNo', label: Text.Admission_No || 'Admission No' },
                    { key: 'studentName', label: Text.Student_Name || 'Student Name' },
                    { key: 'className', label: Text.Class || 'Class' },
                    { key: 'sectionName', label: Text.Section || 'Section' },
                    { key: 'rollNumber', label: Text.Roll_No || 'Roll No' },
                    { key: 'dob', label: Text.Date_Of_Birth || 'Date of Birth' },
                    {
                      key: 'id',
                      label: Text.Photo || 'Photo',
                      render: (_: any, item: StudentWithPhoto) => (
                        <div className="flex justify-center">
                          <PhotoCell student={item} loading={loadingPhotos} />
                        </div>
                      ),
                    },
                  ]}
                  data={filteredStudents}
                  title=""
                  showSearch
                  actionColumn={false}
                  showSelectAll={false}
                  onSearchChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentIDCardManager
