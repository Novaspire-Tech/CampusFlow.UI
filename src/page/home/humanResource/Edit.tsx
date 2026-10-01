import React, { useEffect, useRef, useMemo } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

import NumberField from '../../../components/controlled/NumberField'
import URLInput from '../../../components/controlled/URLInput'
import DropDown from '../../../components/controlled/Dropdown'
import DateField from '../../../components/controlled/DateField'
import MobileField from '../../../components/controlled/MobileField'
import EmailField from '../../../components/controlled/EmailField'
import TextFields from '../../../components/controlled/TextField'
import TextAreaField from '../../../components/controlled/TextareaField'
import IFSCInputField from '../../../components/controlled/IFSCInputField'
import FileUploadField from '../../../components/controlled/FileUploadField'
import { Button, Dropdown } from '../../../components/controlled'
import { IconField } from '../../../components'

import {
  useAddStaff,
  useUpdateStaff,
  useUpdateStaffDocument,
  useStaffByCode,
  useImportStaffFromExcel,
  useDownloadStaffTemplate,
} from '../../../hooks/queries/humanResource/useStaffDirectory'

import { useDepartments } from '../../../hooks/queries/humanResource/useDepartment'
import { useDesignations } from '../../../hooks/queries/humanResource/useDesignation'
import { useDepartments as useClassDepartments } from '../../../hooks/queries/academics/useDepartments'
import { toast } from 'react-toastify'
import StaffBirthDate from '../../../components/controlled/StaffBirthDate'
import ExcelActions from '../../../components/uncontrolled/ExcelActions'
import type { StaffFormData } from '../../../types/humanResource/Staff'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import { useRoles } from '../../../hooks/queries/role/useCreateRole'

interface FormData {
  role: string
  designation: string
  department: string
  classDepartment: string
  firstName: string
  lastName: string
  fatherName: string
  motherName: string
  email: string
  gender: string
  dateOfBirth: string
  bloodGroup: string
  dateOfJoining: string
  phone: string
  emergencyContactNo: string
  maritalStatus: string
  profilePicture?: File
  currentAddress: string
  permanentAddress: string
  qualification: string
  workExperience: string
  note: string
  employmentType: string
  basicSalary: string
  workLocation: string
  sickLeaves: string
  casualLeaves: string
  maternityLeaves: string
  annualLeaves: string
  bankName: string
  branchName: string
  accountNumber: string
  confirmAccountNumber: string
  ifscCode: string
  facebook: string
  twitter: string
  linkedIn: string
  instagram: string
  resume?: File | undefined
  joiningLetter?: File | undefined
  resignationLetter?: File | undefined
  otherDocument?: File | undefined
}
const getClassDeptId = (dept: any): string => {
  if (!dept) return ''
  return String(dept.departmentId ?? dept.classDepartmentId ?? dept.classDepId ?? dept.id ?? '')
}

const extractClassDeptId = (classDept: any): string => {
  if (classDept === null || classDept === undefined) return ''
  if (typeof classDept === 'number' || typeof classDept === 'string') {
    return String(classDept)
  }
  if (typeof classDept === 'object') {
    return getClassDeptId(classDept)
  }
  return ''
}

const toOptional = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const Edit: React.FC = () => {
  const formTopRef = useRef<HTMLDivElement>(null)
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false)
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const { t } = useTranslation()

  const importMutation = useImportStaffFromExcel()
  const downloadMutation = useDownloadStaffTemplate()

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      role: '',
      designation: '',
      department: '',
      classDepartment: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      motherName: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      bloodGroup: '',
      dateOfJoining: '',
      phone: '',
      emergencyContactNo: '',
      maritalStatus: '',
      currentAddress: '',
      permanentAddress: '',
      qualification: '',
      workExperience: '',
      note: '',
      employmentType: '',
      basicSalary: '',
      workLocation: '',
      sickLeaves: '0',
      casualLeaves: '0',
      maternityLeaves: '0',
      annualLeaves: '0',
      bankName: '',
      branchName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      facebook: '',
      twitter: '',
      linkedIn: '',
      instagram: '',
    },
  })

  const isEditMode = !!id

  const { data: staffData, isLoading: isLoadingStaff, isError: isStaffError } = useStaffByCode(id)

  const { data: designationsData } = useDesignations()
  const { data: departmentData } = useDepartments()

  const { data: classDepartmentResponse } = useClassDepartments(0, 500)
  const classDepartmentList = useMemo(() => {
    if (!classDepartmentResponse) return []
    const r = classDepartmentResponse as any
    if (Array.isArray(r?.content)) return r.content
    if (Array.isArray(r?.data)) return r.data
    if (Array.isArray(r)) return r
    return []
  }, [classDepartmentResponse])

  const { data: rolesData = []} = useRoles()
  const roleOptions = useMemo(
  () =>
    rolesData
      .filter((r: any) => r.name !== 'PARENT')   
      .map((r: any) => ({
        value: String(r.roleId),
        label: r.name || 'Unknown Role',
      })),
  [rolesData],
)
  const addStaffMutation = useAddStaff()
  const updateStaffMutation = useUpdateStaff()
  const updateStaffDocumentMutation = useUpdateStaffDocument()

  const [existingDocuments, setExistingDocuments] = React.useState<{
    profilePicture?: string | null
    resume?: string | null
    joiningLetter?: string | null
    otherDocument?: string | null
  }>({})

  const parseDateFromBackend = (dateString: string): string => {
    if (!dateString) return ''
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    if (!isEditMode || !staffData || !classDepartmentList.length) return

    const rawId = extractClassDeptId(staffData.classDepartment)

    console.log('staffData.classDepartment:', staffData.classDepartment)
    console.log('Extracted ID:', rawId)
    console.log(
      'classDepartmentList:',
      classDepartmentList.map((d: any) => ({
        id: d.id,
        departmentId: d.departmentId,
        name: d.name,
      })),
    )

    const matchedDept = classDepartmentList.find((dept: any) => getClassDeptId(dept) === rawId)
    const classDeptValue = matchedDept ? getClassDeptId(matchedDept) : ''

    console.log('Matched dept:', matchedDept)
    console.log('classDeptValue to set:', classDeptValue)

    reset({
      role: staffData.role || '',
      designation: staffData.designation?.name || '',
      department: staffData.department?.name || '',
      classDepartment: classDeptValue,
      firstName: staffData.firstName || '',
      lastName: staffData.lastName || '',
      fatherName: staffData.fatherName || '',
      motherName: staffData.motherName || '',
      email: staffData.email || '',
      gender: staffData.gender || '',
      dateOfBirth: staffData.dateOfBirth || '',
      bloodGroup: staffData.bloodGroup || '',
      dateOfJoining: staffData.dateOfJoining || '',
      phone: staffData.phone || '',
      emergencyContactNo: staffData.emergencyContactNo || '',
      maritalStatus: staffData.maritalStatus || '',
      currentAddress: staffData.currentAddress || '',
      permanentAddress: staffData.permanentAddress || '',
      qualification: staffData.qualification || '',
      workExperience: staffData.workExperience || '',
      note: staffData.note || '',
      employmentType: staffData.payRoll?.employmentType || '',
      basicSalary: staffData.payRoll?.basicSalary?.toString() || '',
      workLocation: staffData.payRoll?.workLocation || '',
      sickLeaves: staffData.staffAssignedLeave?.sickLeaveAssigned?.toString() || '0',
      casualLeaves: staffData.staffAssignedLeave?.casualLeaveAssigned?.toString() || '0',
      maternityLeaves: staffData.staffAssignedLeave?.maternityLeaveAssigned?.toString() || '0',
      annualLeaves: staffData.staffAssignedLeave?.annualLeaveAssigned?.toString() || '0',
      bankName: staffData.staffBankAccountDetails?.bankName || '',
      branchName: staffData.staffBankAccountDetails?.branch || '',
      accountNumber: staffData.staffBankAccountDetails?.accountNumber || '',
      confirmAccountNumber: staffData.staffBankAccountDetails?.confirmAccountNumber || '',
      ifscCode: staffData.staffBankAccountDetails?.IFSCCode || '',
      facebook: staffData.socialMediaLink?.faceBook || '',
      twitter: staffData.socialMediaLink?.twitter || '',
      linkedIn: staffData.socialMediaLink?.linkedIn || '',
      instagram: staffData.socialMediaLink?.instagram || '',
    })

   setExistingDocuments({
  profilePicture: staffData.photo || null,
  resume: staffData.staffDocuments?.resume || null,
  joiningLetter: staffData.staffDocuments?.joiningLetter || null,
  otherDocument: staffData.staffDocuments?.otherDocument || null,
})
  }, [isEditMode, staffData, classDepartmentList, reset])

  useEffect(() => {
    if (submissionSuccess && formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const timer = setTimeout(() => setSubmissionSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [submissionSuccess])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log('Form Data Submitted:', data)
    try {
      const selectedDesignation = designationsData?.find(
        (d: any) => d.name === data.designation || d.designationName === data.designation,
      )
      if (!selectedDesignation) throw new Error('Please select a valid designation')

      const selectedDepartment = departmentData?.find(
        (d: any) => d.name === data.department || d.departmentName === data.department,
      )
      if (!selectedDepartment) throw new Error('Please select a valid department')

      if (!data.classDepartment) throw new Error('Please select a class department')

      const classDepartmentId = Number(data.classDepartment)
      if (isNaN(classDepartmentId)) throw new Error('Invalid class department selected')

      const departmentId = Number(selectedDepartment.id || selectedDepartment.departmentId)
      const designationId = Number(selectedDesignation.id || selectedDesignation.designationId)

      if (isNaN(departmentId) || isNaN(designationId))
        throw new Error('Invalid department or designation ID')

      // Build bankDetails only if any bank field is filled
      const hasAnyBankDetails =
        data.accountNumber?.trim() ||
        data.bankName?.trim() ||
        data.ifscCode?.trim() ||
        data.branchName?.trim()

      const bankDetails: StaffFormData['bankDetails'] = hasAnyBankDetails
        ? {
            accountNumber: data.accountNumber?.trim() || '',
            confirmAccountNumber: data.confirmAccountNumber?.trim() || '',
            bankName: data.bankName?.trim() || '',
            ifscCode: data.ifscCode?.trim() || '',
            branchName: data.branchName?.trim() || '',
          }
        : undefined

      const hasSocialMedia =
        data.facebook?.trim() ||
        data.twitter?.trim() ||
        data.instagram?.trim() ||
        data.linkedIn?.trim()

      const socialMediaLinks: StaffFormData['socialMediaLinks'] = hasSocialMedia
        ? {
            ...(toOptional(data.facebook) && { faceBook: toOptional(data.facebook) }),
            ...(toOptional(data.twitter) && { twitter: toOptional(data.twitter) }),
            ...(toOptional(data.instagram) && { instagram: toOptional(data.instagram) }),
            ...(toOptional(data.linkedIn) && { linkedIn: toOptional(data.linkedIn) }),
          }
        : undefined

      const submitData: StaffFormData = {
        role: data.role,
        classDepartmentId,
        departmentId,
        designationId,
        firstName: data.firstName,
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone,
        gender: data.gender,
        dateOfJoining: parseDateFromBackend(data.dateOfJoining),
        dateOfBirth: parseDateFromBackend(data.dateOfBirth),
        bloodGroup: data.bloodGroup || '',

        // Optional fields
        ...(toOptional(data.fatherName) && { fatherName: toOptional(data.fatherName) }),
        ...(toOptional(data.motherName) && { motherName: toOptional(data.motherName) }),
        ...(toOptional(data.maritalStatus) && { maritalStatus: toOptional(data.maritalStatus) }),
        ...(toOptional(data.emergencyContactNo) && {
          emergencyContactNo: toOptional(data.emergencyContactNo),
        }),
        ...(toOptional(data.qualification) && { qualification: toOptional(data.qualification) }),
        ...(toOptional(data.workExperience) && { workExperience: toOptional(data.workExperience) }),
        ...(toOptional(data.note) && { note: toOptional(data.note) }),
        ...(toOptional(data.currentAddress) && { currentAddress: toOptional(data.currentAddress) }),
        ...(toOptional(data.permanentAddress) && {
          permanentAddress: toOptional(data.permanentAddress),
        }),

        leaves: {
          sickLeaves: parseInt(data.sickLeaves) || 0,
          casualLeaves: parseInt(data.casualLeaves) || 0,
          maternityLeaves: parseInt(data.maternityLeaves) || 0,
          annualLeaves: parseInt(data.annualLeaves) || 0,
        },

        payroll: {
          basicSalary: parseFloat(data.basicSalary) || 0,
          employmentType: data.employmentType,
          workLocation: data.workLocation?.trim() || null,
        },

        bankDetails,
        socialMediaLinks,

        // Files
        profilePicture: data.profilePicture instanceof File ? data.profilePicture : null,
        resume: data.resume instanceof File ? data.resume : null,
        joiningLetter: data.joiningLetter instanceof File ? data.joiningLetter : null,
        otherDocument: data.otherDocument instanceof File ? data.otherDocument : null,
      }

      console.log('Submit data:', submitData)

      if (isEditMode && id) {
        await updateStaffMutation.mutateAsync({ staffCode: id, data: submitData })

        const hasAnyFile =
          data.profilePicture instanceof File ||
          data.resume instanceof File ||
          data.joiningLetter instanceof File ||
          data.otherDocument instanceof File

        if (hasAnyFile) {
          await updateStaffDocumentMutation.mutateAsync({
            staffCode: id,
            profilePicture: data.profilePicture instanceof File ? data.profilePicture : undefined,
            resume: data.resume instanceof File ? data.resume : undefined,
            joiningLetter: data.joiningLetter instanceof File ? data.joiningLetter : undefined,
            otherDocument: data.otherDocument instanceof File ? data.otherDocument : undefined,
          })
        }

        toast.success('Staff updated successfully')
        setSubmissionSuccess(true)
        setTimeout(() => navigate('/staff-directory'), 1500)
      } else {
        await addStaffMutation.mutateAsync(submitData)
        toast.success('Staff added successfully')
        setSubmissionSuccess(true)

        reset({
          role: '',
          designation: '',
          department: '',
          classDepartment: '',
          firstName: '',
          lastName: '',
          fatherName: '',
          motherName: '',
          email: '',
          gender: '',
          dateOfBirth: '',
          bloodGroup: '',
          dateOfJoining: '',
          phone: '',
          emergencyContactNo: '',
          maritalStatus: '',
          currentAddress: '',
          permanentAddress: '',
          qualification: '',
          workExperience: '',
          note: '',
          employmentType: '',
          basicSalary: '',
          workLocation: '',
          sickLeaves: '0',
          casualLeaves: '0',
          maternityLeaves: '0',
          annualLeaves: '0',
          bankName: '',
          branchName: '',
          accountNumber: '',
          confirmAccountNumber: '',
          ifscCode: '',
          facebook: '',
          twitter: '',
          linkedIn: '',
          instagram: '',
        })
        setExistingDocuments({})
      }
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error(error.message || 'Failed to submit form')
      setSubmissionSuccess(false)
    }
  }

  const texts = getPagesDataText(t)
  const isLoading = addStaffMutation.isPending || updateStaffMutation.isPending

  if (isEditMode && isLoadingStaff) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="ml-3">{texts.Loading}</span>
      </div>
    )
  }

  if (isEditMode && isStaffError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{texts.Error_loading_staff}</p>
        <Button
          name={texts.Back}
          loading={false}
          onClick={() => navigate(-1)}
          icon={<IconField name="FaArrowLeft" />}
        />
      </div>
    )
  }

  const genderOptions = ['MALE', 'FEMALE', 'OTHER']
  const maritalStatusOptions = ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED']
  const employmentTypeOptions = ['FULL_TIME', 'PART_TIME', 'CONTRACT']

  return (
    <div ref={formTopRef} className="p-4 bg-white shadow rounded-lg">
      <AllSchoolDropdown
        onSubmit={handleSubmit(onSubmit)}
        queryKeys={['staff', 'Departments', 'Designations', 'departments']}
      >
        <div className="mb-6 flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? texts.Edit_Staff_Member : texts.Add_New_Staff_Member}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode
                ? texts.Update_The_Information_Below_To_Modify_Staff_Details
                : texts.Fill_In_The_Information_Below_To_Add_A_New_Staff_Member}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExcelActions
              uploadEndpoint="/school-group/{schoolGroupCode}/school/{schoolCode}/staff/add/xl-sheet"
              importMutation={importMutation}
              downloadMutation={downloadMutation}
              importLabel="Import Staff XL"
              downloadLabel="Download Staff Template"
              onImportSuccess={() => {}}
            />
          </div>
        </div>

        {/*  Basic Information  */}
        <h2 className="bg-gray-200 text-gray-800 text-lg font-semibold px-3 py-2 mb-4 rounded">
          {texts.Section_Title || 'Basic Information'}
        </h2>

        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-4">
            <DropDown
              label={texts.Role || 'Role'}
              name="role"
              control={control}
              required
              options={roleOptions}
            />
            <DropDown
              label={texts.Designation || 'Designation'}
              name="designation"
              control={control}
              required
              options={
                designationsData?.map((designation: any) => ({
                  value: designation.name || designation.designationName,
                  label: designation.name || designation.designationName,
                })) || []
              }
            />
            <DropDown
              label={texts.Class_Department}
              name="classDepartment"
              control={control}
              required={true}
              options={classDepartmentList.map((dept: any) => ({
                value: getClassDeptId(dept),
                label: dept.name,
              }))}
            />
            <DropDown
              label={texts.Department || 'Department'}
              name="department"
              control={control}
              required
              options={
                departmentData?.map((department: any) => ({
                  value: department.name || department.departmentName,
                  label: department.name || department.departmentName,
                })) || []
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <TextFields
              name="firstName"
              label={texts.First_Name || 'First Name'}
              control={control}
              placeholder={texts.First_Name || 'First Name'}
              required
            />
            <TextFields
              name="lastName"
              label={texts.Last_Name || 'Last Name '}
              control={control}
              placeholder={texts.Last_Name || 'Last Name '}
            />
            <TextFields
              name="fatherName"
              label={texts.Father_Name || 'Father Name '}
              placeholder="Enter Father Name"
              control={control}
            />
            <TextFields
              name="motherName"
              label={texts.Mother_Name || 'Mother Name '}
              placeholder={texts.Mother_Name || 'Mother Name '}
              control={control}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <EmailField
              name="email"
              label={texts.Email || 'Email '}
              control={control}
              placeholder={texts.Email_Placeholder || 'Enter email address'}
            />
            <DropDown
              label={texts.Gender || 'Gender'}
              name="gender"
              control={control}
              required
              options={genderOptions}
            />
            <StaffBirthDate
              name="dateOfBirth"
              label={texts.Date_Of_Birth || 'Date of Birth'}
              control={control}
              required
            />
            <DateField
              name="dateOfJoining"
              label={texts.Date_Of_Joining || 'Date of Joining'}
              control={control}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <MobileField
              name="phone"
              label={texts.Phone || 'Phone'}
              control={control}
              placeholder={texts.Phone || 'Phone'}
              required
            />
            <MobileField
              name="emergencyContactNo"
              label={texts.Emergency_Contact_Number || 'Emergency Contact'}
              placeholder={texts.Emergency_Contact_Number || 'Emergency Contact'}
              control={control}
            />
            <DropDown
              label={texts.Marital_Status || 'Marital Status '}
              name="maritalStatus"
              control={control}
              options={maritalStatusOptions}
            />
            <Dropdown
              label={texts.Blood_Group}
              name="bloodGroup"
              control={control}
              options={['O+', 'A+', 'B+', 'AB+', 'AB-', 'O-', 'A-', 'B-']}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <TextFields
              name="qualification"
              label={texts.Qualification || 'Qualification '}
              control={control}
              placeholder={texts.Qualification || 'Enter qualification'}
            />
            <TextFields
              name="workExperience"
              label={texts.Work_Experience || 'Work Experience '}
              control={control}
              placeholder={texts.Work_Experience || 'Work Experience '}
            />
            <FileUploadField
              name="profilePicture"
              label={texts.Profile_Picture}
              control={control}
              existingFileUrl={existingDocuments.profilePicture}
            />
            <TextFields
              name="note"
              label={texts.Note || 'Note '}
              control={control}
              placeholder={texts.Note_Placeholder || 'Additional notes'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TextAreaField
              name="currentAddress"
              label={texts.Current_Address || 'Current Address '}
              control={control}
              placeholder={texts.Current_Address_Placeholder || 'Enter current address'}
              rows={2}
            />
            <TextAreaField
              name="permanentAddress"
              label={texts.Permanent_Address || 'Permanent Address'}
              control={control}
              placeholder={texts.Permanent_Address_Placeholder || 'Enter permanent address'}
              rows={2}
            />
          </div>
        </div>

        <h2 className="bg-gray-200 text-gray-800 text-lg font-semibold px-3 py-2 mb-4 rounded mt-6">
          {texts.Payroll || 'Payroll Information'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <DropDown
            label={texts.Employment_Type}
            name="employmentType"
            control={control}
            required
            options={employmentTypeOptions}
          />
          <NumberField
            name="basicSalary"
            label={texts.basic_salary || 'Basic Salary'}
            control={control}
            placeholder={texts.basic_salary || 'Basic Salary'}
            required
          />
          <TextFields
            name="workLocation"
            label={texts.work_location || 'Work Location'}
            placeholder="Enter work location"
            control={control}
          />
        </div>

        <h2 className="bg-gray-200 text-gray-800 text-lg font-semibold px-3 py-2 mb-4 rounded mt-6">
          {texts.Leaves || 'Leave Allocation'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <NumberField name="sickLeaves" label={texts.Sick_Leaves} control={control} />
          <NumberField name="casualLeaves" label={texts.Casual_Leaves} control={control} />
          <NumberField name="maternityLeaves" label={texts.Maternity_Leaves} control={control} />
          <NumberField name="annualLeaves" label={texts.Annual_Leaves} control={control} />
        </div>

        <h2 className="bg-gray-200 text-gray-800 text-lg font-semibold px-3 py-2 mb-4 rounded mt-6">
          {texts.Bank_Account_Details || 'Bank Account Details '}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <TextFields
            name="bankName"
            label={texts.bank_name || 'Bank Name'}
            placeholder="Enter bank name"
            control={control}
          />
          <TextFields
            name="branchName"
            label={texts.bank_branch_name || 'Branch Name'}
            placeholder="Enter branch name"
            control={control}
          />
          <NumberField
            name="accountNumber"
            label={texts.Bank_Account_Number}
            placeholder="Enter account number"
            control={control}
          />
          <NumberField
            name="confirmAccountNumber"
            label={texts.Confirm_Account_Number}
            control={control}
            placeholder="Re-enter account number"
            rules={{
              required: true,
              validate: (value: string) =>
                value === watch('accountNumber') || 'Account numbers do not match',
            }}
          />
          <IFSCInputField
            name="ifscCode"
            label={texts.ifsc_code || 'IFSC Code'}
            control={control}
            placeholder="Enter 11-digit IFSC"
          />
        </div>

        <div>
          <h1 className="bg-gray-200 text-gray-800 text-lg font-semibold px-3 py-2 mb-4 rounded mt-6">
            {texts.Upload_Documents}
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 p-1">
            <FileUploadField
              name="resume"
              control={control}
              label={texts.Resume}
              existingFileUrl={existingDocuments.resume}
            />
            <FileUploadField
              name="joiningLetter"
              control={control}
              label={texts.Joining_Letter}
              existingFileUrl={existingDocuments.joiningLetter}
            />
            <FileUploadField
              name="otherDocument"
              control={control}
              label={texts.Other_Document}
              existingFileUrl={existingDocuments.otherDocument}
            />
          </div>
        </div>

        <h2 className="bg-gray-200 text-gray-800 text-lg font-semibold px-3 py-2 mb-4 rounded mt-6">
          {texts.Social_Media_Link || 'Social Media Links '}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <URLInput
            name="facebook"
            label={texts.facebook_page || 'Facebook Page'}
            control={control}
            placeholder="https://facebook.com/yourpage"
          />
          <URLInput
            name="twitter"
            label={texts.twitter_page || 'Twitter Page'}
            control={control}
            placeholder="https://twitter.com/yourpage"
          />
          <URLInput
            name="linkedIn"
            label={texts.linkedin_url || 'LinkedIn'}
            control={control}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          <URLInput
            name="instagram"
            label={texts.instagram_url || 'Instagram'}
            control={control}
            placeholder="https://instagram.com/yourpage"
          />
        </div>

        <div className="flex justify-end p-4 gap-2 mt-6 border-t border-gray-200">
          <Button
            name={texts.Cancel || 'Cancel'}
            loading={false}
            type="button"
            icon={<IconField name="FaArrowLeft" />}
            onClick={() => navigate('/staff-directory')}
          />
          <Button
            name={isEditMode ? texts.Update || 'Update' : texts.Save || 'Save'}
            loading={isLoading}
            icon={<IconField name={isEditMode ? 'FaSyncAlt' : 'FaSave'} />}
          />
        </div>
      </AllSchoolDropdown>
    </div>
  )
}

export default Edit