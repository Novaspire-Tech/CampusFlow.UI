import React, { useMemo, useState, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Dropdown, TextField } from '../../../components/controlled'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useDepartments, useDepartmentsByClassId } from '../../../hooks/queries/academics/useDepartments'
import { useFeesAwaitingPayment } from '../../../hooks/queries/feesCollection/useFeesAwaitingPayment'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import type {
    FlatFeeSummaryRow,
    FeePaymentStatus,
} from '../../../types/feesCollection/feesAwaitingPayments'

const FEE_STATUS_OPTIONS = [
    { label: 'Paid', value: 'PAID' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Unpaid', value: 'UNPAID' },
]

interface SearchFormInputs {
    classId: string
    sectionId: string
    departmentId: string
    feeStatus: string
    search: string
}

const FeesAwaitingPayments: React.FC = () => {
    const {
        control,
        handleSubmit,
        reset: resetSearchForm,
        watch,
        setValue: setSearchValue,
    } = useForm<SearchFormInputs>({
        defaultValues: { classId: '', sectionId: '', departmentId: '', feeStatus: '', search: '' },
    })

    const { data: classesData } = useSchoolClasses()
    const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)

    const watchedClassId = watch('classId')

    const { data: sectionsData, isLoading: isLoadingSections } = useSections(
        selectedClassForSections > 0 ? selectedClassForSections : 0,
    )

    // Always fetch all departments (shown when no class selected)
    const { data: allDepartmentsData } = useDepartments(0, 1000)

    // Fetch departments filtered by class (only when a class is selected)
    const { data: classDepartmentsData, isLoading: isLoadingClassDepartments } = useDepartmentsByClassId(
        selectedClassForSections > 0 ? selectedClassForSections : undefined,
    )

    const isLoadingDepartments = selectedClassForSections > 0 ? isLoadingClassDepartments : false

    useEffect(() => {
        if (watchedClassId) {
            setSelectedClassForSections(Number(watchedClassId))
            setSearchValue('sectionId', '')
            setSearchValue('departmentId', '')
        } else {
            setSelectedClassForSections(0)
            setSearchValue('sectionId', '')
            setSearchValue('departmentId', '')
        }
    }, [watchedClassId, setSearchValue])

    const classOptions = useMemo(
        () =>
            classesData?.map((cls: any) => ({
                value: String(cls.schoolClassId ?? cls.id),
                label: cls.className ?? cls.name,
            })) ?? [],
        [classesData],
    )

    const sectionOptions = useMemo(
        () =>
            sectionsData?.map((sec: any) => ({
                value: String(sec.sectionId ?? sec.id),
                label: sec.sectionName ?? sec.name,
            })) ?? [],
        [sectionsData],
    )

    const departmentOptions = useMemo(() => {
        const source = selectedClassForSections > 0
            ? (Array.isArray(classDepartmentsData) ? classDepartmentsData : [])
            : (allDepartmentsData?.data ?? [])

        return source.map((dep: any) => ({
            value: String(dep.departmentId ?? dep.id),
            label: dep.name ?? dep.departmentName,
        }))
    }, [selectedClassForSections, classDepartmentsData, allDepartmentsData])

    const { flatRows, isLoading, hasSearched, fetchSummary, clearResults, totals } =
        useFeesAwaitingPayment()
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const totalItems = flatRows.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const paginatedData = useMemo(
        () => flatRows.slice(page * pageSize, (page + 1) * pageSize),
        [flatRows, page, pageSize],
    )

    const onSearch: SubmitHandler<SearchFormInputs> = async (data) => {
        setPage(0)
        await fetchSummary({
            schoolClassId: data.classId ? Number(data.classId) : null,
            sectionId: data.sectionId ? Number(data.sectionId) : null,
            classDepartmentId: data.departmentId ? Number(data.departmentId) : null,
            search: data.search || null,
            feePaymentStatus: (data.feeStatus as FeePaymentStatus) || null,
        })
    }

    const handleClearFilters = () => {
        resetSearchForm()
        setSelectedClassForSections(0)
        setPage(0)
        clearResults()
    }

    const columns = [
        {
            label: 'Admission No',
            key: 'admissionNumber',
            render: (_: string, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? (
                    <span className="font-medium text-gray-700">{row.admissionNumber || '—'}</span>
                ) : null,
        },
        {
            label: 'Student Name',
            key: 'studentName',
            render: (_: string, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? (
                    <span className="font-semibold text-gray-800">{row.studentName}</span>
                ) : null,
        },
        {
            label: 'Father Name',
            key: 'fatherName',
            render: (_: string, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? (
                    <span className="text-sm text-gray-600">{row.fatherName || '—'}</span>
                ) : null,
        },
        {
            label: 'Phone',
            key: 'phone',
            render: (_: string, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? (
                    <span className="text-sm text-gray-600">{row.phone || '—'}</span>
                ) : null,
        },
        {
            label: 'Class',
            key: 'className',
            render: (_: string, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? <span>{row.className}</span> : null,
        },
        {
            label: 'Section',
            key: 'sectionName',
            render: (_: string, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? <span>{row.sectionName}</span> : null,
        },
        {
            label: 'RTE',
            key: 'rte',
            render: (_: boolean, row: FlatFeeSummaryRow) =>
                row.isFirstRow ? (
                    <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.rte ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                        {row.rte ? 'Yes' : 'No'}
                    </span>
                ) : null,
        },
        {
            label: 'Fee Name',
            key: 'feeName',
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
        {
            label: 'Total Fee (₹)',
            key: 'totalFee',
            render: (value: number) => (
                <span className="font-medium">
                    ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            label: 'Paid (₹)',
            key: 'paid',
            render: (value: number) => (
                <span className="text-green-600 font-medium">
                    ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            label: 'Pending (₹)',
            key: 'pending',
            render: (value: number) => (
                <span className={`font-bold ${Number(value) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
    ]

    return (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">

            {/* ── Page header ── */}
            <div className="p-4 bg-gray-50 border-b rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">Fees Awaiting Payments</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Search students to view their pending fee summary
                </p>
            </div>

            <AllSchoolDropdown
                onSubmit={handleSubmit(onSearch)}
                queryKeys={['sections', 'schoolClasses']}
                className="rounded-lg bg-white mb-4 p-4 shadow-sm border border-gray-100"
            >
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Dropdown
                        label="Class"
                        name="classId"
                        control={control}
                        options={classOptions}
                    />
                    <Dropdown
                        label="Section"
                        name="sectionId"
                        control={control}
                        options={
                            !selectedClassForSections
                                ? [{ label: 'Please select a class first', value: '' }]
                                : isLoadingSections
                                    ? [{ label: 'Loading sections...', value: '' }]
                                    : sectionOptions.length === 0
                                        ? [{ label: 'No sections available', value: '' }]
                                        : sectionOptions
                        }
                    />
                    <Dropdown
                        label="Department"
                        name="departmentId"
                        control={control}
                        options={
                            isLoadingDepartments
                                ? [{ label: 'Loading departments...', value: '' }]
                                : departmentOptions.length === 0
                                    ? [{ label: 'No departments available', value: '' }]
                                    : departmentOptions
                        }
                    />
                    <Dropdown
                        label="Fee Status"
                        name="feeStatus"
                        control={control}
                        options={FEE_STATUS_OPTIONS}
                    />
                    <TextField
                        label="Name / Search"
                        name="search"
                        control={control}
                        placeholder="Enter student name"
                    />
                </div>

                <div className="px-4 pb-4 flex justify-end gap-2">
                    {hasSearched && (
                        <Button
                            name="Clear"
                            icon={<IconField name="FaTimes" size={16} />}
                            onClick={handleClearFilters}
                            loading={false}
                            showAlways
                        />
                    )}
                    <Button
                        name="Search"
                        icon={<IconField name="FaSearch" />}
                        loading={isLoading}
                        showAlways
                    />
                </div>
            </AllSchoolDropdown>

            {/* ── Loading indicator ── */}
            {isLoading && (
                <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
                    <IconField name="FaSpinner" size={14} className="animate-spin" />
                    <span>Fetching fee summary...</span>
                </div>
            )}

            {/* ── Results panel — only shown after first search ── */}
            {hasSearched && !isLoading && (
                <div className="mt-4 p-4 rounded-lg bg-white shadow-sm border border-gray-100">

                    {flatRows.length > 0 ? (
                        <>
                            {/* Header row */}
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-base font-semibold text-gray-700">Fee Summary</h2>
                                <span className="text-sm text-gray-500">
                                    {flatRows.filter((r) => r.isFirstRow).length} student
                                    {flatRows.filter((r) => r.isFirstRow).length !== 1 ? 's' : ''} found
                                </span>
                            </div>

                            {/* Totals cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">
                                        Total Fees
                                    </p>
                                    <p className="text-base font-bold text-blue-700">
                                        ₹{totals.totalFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-green-500 font-medium uppercase tracking-wide mb-1">
                                        Total Paid
                                    </p>
                                    <p className="text-base font-bold text-green-700">
                                        ₹{totals.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-red-500 font-medium uppercase tracking-wide mb-1">
                                        Total Pending
                                    </p>
                                    <p className="text-base font-bold text-red-700">
                                        ₹{totals.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Table */}
                            <ControlledTable
                                data={paginatedData}
                                columns={columns}
                                searchTerm=""
                                onSearchChange={() => { }}
                                title="Students with Fees Awaiting Payments"
                                actionColumn={false}
                                showSearch={false}
                                btn={false}
                                header={false}
                                showSelectAll={false}
                                enablePermissions={false}
                                showExport={true}
                                exportFilename="Fees Awaiting Payments"
                                exportTitle="Fees Awaiting Payments Report"
                                serverPage={page}
                                serverTotalPages={totalPages}
                                serverTotalItems={totalItems}
                                serverPageSize={pageSize}
                                onServerPageChange={(p: number) => setPage(p)}
                                onServerPageSizeChange={(s: number) => {
                                    setPageSize(s)
                                    setPage(0)
                                }}
                            />
                        </>
                    ) : (
                        /* Empty state */
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-5xl mb-3">🔍</div>
                            <p className="text-sm font-medium">No records found</p>
                            <p className="text-xs mt-1">Try adjusting your filters and search again</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FeesAwaitingPayments