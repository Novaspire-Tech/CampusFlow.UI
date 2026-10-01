import React, { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import ControlledTable from '../../../../components/uncontrolled/ControlledTable'
import Dropdown from '../../../../components/controlled/Dropdown'
import TextFields from '../../../../components/controlled/TextField'
import Button from '../../../../components/controlled/Button'
import IconField from '../../../../components/IconField'
import { studentService } from '../../../../services/studentInformation/studentService'
import { useSchoolClasses } from '../../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../../hooks/queries/academics/useSections'
import { useStudentCategories } from '../../../../hooks/queries/studentInformation/useStudentCategories'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'

interface Student {
  id: string | number
  studentId: string | number
  rollNo: string | number
  photo: string
  name: string
  studentName: string
  gender: string
  class: number
  className: string
  classId?: string | number
  section: string
  sectionName: string
  sectionId?: string | number
  fatherName: string
  parents: string
  address: string
  currentAddress: string
  dob: string
  dateOfBirth: string
  phone: string
  phoneNumber: string
  email: string
  admissionNo: string
  uid?: string
  category?: string
  categoryName?: string
  mobileNumber?: string
  // Additional fields from StudentDetails
  admissionDate?: string
  bloodGroup?: string
  religion?: string
  castName?: string
  motherName?: string
  permanentAddress?: string
  previousSchool?: string
}

interface ClassSearchFormValues {
  searchClass: string | number
  searchSection: string | number
}

interface KeywordSearchFormValues {
  searchKeyword: string
}

const MyStudentsTable: React.FC = () => {
   const { t } = useTranslation();
  const T = getPagesDataText(t);
  const [tableData, setTableData] = useState<Student[]>([])
  const [fullStudentsData, setFullStudentsData] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: classesData } = useSchoolClasses()
  const { data: categoriesData } = useStudentCategories()

  const {
    control: classControl,
    reset: classReset,
    handleSubmit: handleClassSubmit,
    watch,
  } = useForm<ClassSearchFormValues>({
    defaultValues: {
      searchClass: '',
      searchSection: '',
    },
    mode: 'onSubmit',
  })

  const {
    control: keywordControl,
    handleSubmit: handleKeywordSubmit,
    reset: keywordReset,
  } = useForm<KeywordSearchFormValues>({
    defaultValues: {
      searchKeyword: '',
    },
    mode: 'onSubmit',
  })

  const selectedClass = watch('searchClass')
  const { data: sectionsData } = useSections(Number(selectedClass) || 0)

  const categoryMap = useMemo(() => {
    if (!categoriesData) return new Map()
    return new Map(categoriesData.map((cat: any) => [cat.id, cat.name]))
  }, [categoriesData])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await studentService.getAll(0, 100)

      if (!response || !response.students) {
        throw new Error('Invalid response from server')
      }

      const transformedStudents: Student[] = response.students.map((student: any) => {
        const firstName = student.firstName || ''
        const middleName = student.middleName || ''
        const lastName = student.lastName || ''
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim()

        const categoryName = student.studentCategoryId
          ? categoryMap.get(student.studentCategoryId) ||
            student.studentCategoryName ||
            student.categoryName ||
            'N/A'
          : student.studentCategoryName || student.categoryName || 'N/A'

        return {
          id: student.studentId?.toString() || student.id?.toString() || '',
          studentId: student.studentId?.toString() || student.id?.toString() || '',
          rollNo: student.rollNo || '',
          photo: student.photo || '',
          name: student.studentName || fullName,
          studentName: student.studentName || fullName,
          gender: student.gender || '',
          class: parseInt(student.classId || student.class || 0),
          classId: student.classId?.toString(),
          className: student.className || student.class || '',
          section: student.sectionName || student.section || '',
          sectionId: student.sectionId?.toString(),
          sectionName: student.sectionName || student.section || '',
          fatherName: student.fatherName || '',
          parents: student.fatherName || '',
          address: student.currentAddress || student.permanentAddress || '',
          currentAddress: student.currentAddress || student.address || '',
          dob: student.dob || '',
          dateOfBirth: student.dob || '',
          phone: student.phoneNumber || student.parentPhone || '',
          phoneNumber: student.phoneNumber || student.parentPhone || '',
          mobileNumber: student.phoneNumber || student.parentPhone || '',
          email: student.email || '',
          admissionNo: student.admissionNo || '',
          uid: student.aadhaarNumber || '',
          category: categoryName,
          categoryName: categoryName,
          admissionDate: student.admissionDate || '',
          bloodGroup: student.bloodGroup || '',
          religion: student.religion || '',
          castName: student.castName || '',
          motherName: student.motherName || '',
          permanentAddress: student.permanentAddress || '',
          previousSchool: student.previousSchool || '',
        }
      })

      setFullStudentsData(transformedStudents)
      setTableData(transformedStudents)
    } catch (error: any) {
      console.error('Error fetching students:', error)
      setError(error.message || 'Failed to load students. Please try again.')
      setFullStudentsData([])
      setTableData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [categoryMap])

  const handleCancelClassSearch = () => {
    classReset({
      searchClass: '',
      searchSection: '',
    })
    setTableData(fullStudentsData)
  }

  const handleCancelKeywordSearch = () => {
    keywordReset({ searchKeyword: '' })
    setTableData(fullStudentsData)
  }

  const onSubmitKeywordSearch = async (data: KeywordSearchFormValues) => {
    try {
      const keyword = data.searchKeyword?.toLowerCase().trim() || ''
      if (keyword) {
        const filtered = fullStudentsData.filter(
          (item) =>
            item.studentName?.toLowerCase().includes(keyword) ||
            item.admissionNo?.toLowerCase().includes(keyword) ||
            item.uid?.toLowerCase().includes(keyword) ||
            item.fatherName?.toLowerCase().includes(keyword),
        )
        setTableData(filtered)
      } else {
        setTableData(fullStudentsData)
      }
    } catch (error) {
      console.error('Keyword search error:', error)
    }
  }

  const onSubmitClassSearch = async (data: ClassSearchFormValues) => {
    try {
      const { searchClass, searchSection } = data

      if (searchClass || searchSection) {
        const filtered = fullStudentsData.filter(
          (item) =>
            (!searchClass || String(item.classId) === String(searchClass)) &&
            (!searchSection || String(item.sectionId) === String(searchSection)),
        )
        setTableData(filtered)
      } else {
        setTableData(fullStudentsData)
      }
    } catch (error) {
      console.error('Class search error:', error)
    }
  }

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: c.id,
      })) || [],
    [classesData],
  )

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((s: any) => ({
        label: s.name || s.sectionName,
        value: s.id,
      })) || [],
    [sectionsData],
  )

  const columns = useMemo(
    () => [
      {
        key: 'admissionNo',
        label: T.Admission_No,
        width: '120px',
      },
      {
        key: 'studentName',
        label: T.Name,
        width: '180px',
      },
      {
        key: 'rollNo',
        label: T.Roll_No,
        width: '80px',
      },
      {
        key: 'className',
        label: T.Class,
        width: '100px',
      },
      {
        key: 'sectionName',
        label: T.Section,
        width: '100px',
      },
      {
        key: 'category',
        label: T.Category,
        width: '120px',
      },
      {
        key: 'fatherName',
        label: T.Father_Name,
        width: '150px',
      },
      {
        key: 'dob',
        label: T.Date_Of_Birth,
        width: '120px',
      },
      {
        key: 'gender',
        label:T.Gender,
        width: '80px',
      },
      {
        key: 'mobileNumber',
        label: T.Mobile_Number,
        width: '130px',
      },
      {
        key: 'uid',
        label: T.Aadhaar_Number,
        width: '120px',
      },
      {
        key: 'address',
        label: T.permanent_address,
        width: '200px',
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">My Students</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center text-red-700">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">{T.My_Students}</h2>
        </div>

        {/* Search forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{T.Search_by_Class_Section}</h3>
            <form onSubmit={handleClassSubmit(onSubmitClassSearch)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Dropdown
                  name="searchClass"
                  label={T.Class}
                  control={classControl}
                  required={false}
                  options={classOptions}
                />
                <Dropdown
                  name="searchSection"
                  label={T.Section}
                  control={classControl}
                  required={false}
                  options={sectionOptions}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  name={T.search}
                  loading={false}
                  icon={<IconField name="FaSearch" size={18} />}
                />
                <Button
                  name={T.Cancel}
                  icon={<IconField name="FaTimes" size={18} />}
                  onClick={handleCancelClassSearch}
                  loading={false}
                />
              </div>
            </form>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {T.Search_By_Name_Admission_No}
            </h3>
            <form onSubmit={handleKeywordSubmit(onSubmitKeywordSearch)} className="space-y-3">
              <TextFields
                name="searchKeyword"
                label= {T.Name_Admission_UID}
                placeholder={T.Enter_name_admission_number_or_UID}
                control={keywordControl}
                required={false}
              />
              <div className="flex gap-2">
                <Button
                  name={T.search}
                  loading={false}
                  icon={<IconField name="FaSearch" size={18} />}
                />
                <Button
                  name={T.Cancel}
                  icon={<IconField name="FaTimes" size={18} />}
                  onClick={handleCancelKeywordSearch}
                  loading={false}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {tableData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No students found</div>
          <div className="text-gray-400">Try adjusting your search criteria</div>
        </div>
      ) : (
        <ControlledTable
          columns={columns}
          data={tableData}
          fullData={fullStudentsData}
          // onView={handleView}
          btn={false}
          header={false}
          showSearch={false}
          showExport={true}
          showSelectAll={false}
          showPaginationFooter={true}
          actionColumn={false}
        />
      )}
    </div>
  )
}

export default MyStudentsTable

 