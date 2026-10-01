import { useState } from 'react'
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form'
import DateField from '../../../components/controlled/DateField'
import { Dropdown } from '../../../components/controlled'
import NumberField from '../../../components/controlled/NumberField'
import TextField from '../../../components/controlled/TextField'
import TextareaField from '../../../components/controlled/TextareaField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import ExcelActions from '../../../components/uncontrolled/ExcelActions'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useFilterListBooks,
  useAddListBook,
  useUpdateListBook,
  useDeleteListBook,
  useDeleteMultipleListBooks,
  useImportBookListFromExcel,
  useDownloadBookListTemplate,
} from '../../../hooks/queries/library/useBookList'
import type { BookList, BookListSearchParams } from '../../../types/library/bookList'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface BookFormInputs {
  bookTitle: string
  description: string
  bookNo: string
  isbnNumber: string
  author: string
  publisher: string
  subject: string
  rackNumber: string
  quantity: string
  available: string
  price: string
  postDate: string
}

const BookLists = () => {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [activeFilters, setActiveFilters] = useState<BookListSearchParams>({})
  const [tableKey, setTableKey] = useState(0)

  // ✅ sortDirection never changes — plain const instead of state
  const sortDirection = 'asc' as const

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const {
    data: booksResponse,
    isLoading,
    isFetching,
  } = useFilterListBooks(activeFilters, page, pageSize, sortDirection)

  const { mutateAsync: addBook, isPending: isAdding } = useAddListBook()
  const { mutateAsync: updateBook, isPending: isUpdating } = useUpdateListBook()
  const { mutateAsync: deleteBook } = useDeleteListBook()
  const { mutateAsync: deleteMultipleBooks } = useDeleteMultipleListBooks()

  const importMutation = useImportBookListFromExcel()
  const downloadMutation = useDownloadBookListTemplate()

  const books = booksResponse?.books ?? []
  const totalItems = booksResponse?.totalItems ?? 0
  const totalPages = booksResponse?.totalPages ?? 0

  const { control, handleSubmit, reset, setValue } = useForm<BookFormInputs>({
    defaultValues: {
      bookTitle: '',
      description: '',
      bookNo: '',
      isbnNumber: '',
      author: '',
      publisher: '',
      subject: '',
      rackNumber: '',
      quantity: '',
      available: 'Yes',
      price: '',
      postDate: '',
    },
  })

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterSearch: '' },
  })

  const handlePageChange = (newPage: number) => setPage(newPage)

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = (data: FieldValues) => {
    const params: BookListSearchParams = {}
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim()
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterSearch: '' })
    setActiveFilters({})
    setPage(0)
  }

  const onSubmit: SubmitHandler<BookFormInputs> = async (data) => {
    try {
      if (!data.bookTitle?.trim()) {
        toast.error('Book title is required')
        return
      }

      const isDuplicateISBN = books.some(
        (book) =>
          book.isbnNumber === data.isbnNumber && book.id !== editId && data.isbnNumber?.trim(),
      )
      if (isDuplicateISBN) {
        toast.error(`A book with ISBN number "${data.isbnNumber}" already exists`)
        return
      }

      const isDuplicateBookNo = books.some(
        (book) => book.bookNo === data.bookNo && book.id !== editId && data.bookNo?.trim(),
      )
      if (isDuplicateBookNo) {
        toast.error(`A book with book number "${data.bookNo}" already exists`)
        return
      }

      const isDuplicateTitle = books.some(
        (book) =>
          book.bookTitle.toLowerCase() === data.bookTitle.toLowerCase() && book.id !== editId,
      )
      if (isDuplicateTitle) {
        toast.error(`A book with title "${data.bookTitle}" already exists`)
        return
      }

      if (editId) {
        const existing = books.find((b) => b.id === editId)
        if (existing) {
          await updateBook({ id: editId, data: { ...existing, ...data } as BookList })
          toast.success(`Book "${data.bookTitle}" updated successfully!`)
        }
        setEditId(null)
      } else {
        await addBook({ ...data })
        toast.success(`Book "${data.bookTitle}" added successfully!`)
      }

      reset()
      setShowForm(false)
    } catch (error: any) {
      if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.message
        if (
          errorMessage?.toLowerCase().includes('already exists') ||
          errorMessage?.toLowerCase().includes('duplicate')
        ) {
          toast.error(
            'This book already exists in the system. Please check ISBN, Book Number, or Title.',
          )
        } else if (errorMessage?.toLowerCase().includes('isbn')) {
          toast.error('Invalid or duplicate ISBN number')
        } else if (errorMessage?.toLowerCase().includes('book number')) {
          toast.error('Invalid or duplicate book number')
        } else {
          toast.error(errorMessage || 'Invalid data. Please check all fields and try again.')
        }
      } else if (error?.response?.status === 409) {
        toast.error('This book already exists. Please check the book details.')
      } else {
        toast.error(error?.message || 'Operation failed. Please try again.')
      }
    }
  }

  const handleEdit = (id: string | number) => {
    const bookId = id.toString()
    const book = books.find((b) => b.id === bookId)
    if (!book) {
      toast.error('Book not found')
      return
    }
    setValue('bookTitle', book.bookTitle)
    setValue('description', book.description || '')
    setValue('bookNo', book.bookNo)
    setValue('isbnNumber', book.isbnNumber)
    setValue('author', book.author)
    setValue('publisher', book.publisher)
    setValue('subject', book.subject)
    setValue('rackNumber', book.rackNumber)
    setValue('quantity', book.quantity)
    setValue('available', book.available)
    setValue('price', book.price)
    setValue('postDate', book.postDate)
    setEditId(bookId)
    setShowForm(true)
  }

  const handleDelete = async (id: string | number) => {
    const book = books.find((b) => b.id === id.toString())
    if (!book) {
      toast.error('Book not found')
      return
    }
    if (await confirmToast(Text.Do_you_want_to_delete_this_entry)) {
      try {
        await deleteBook(id.toString())
        toast.success(`Book "${book.bookTitle}" deleted successfully!`)
        reset()
        setEditId(null)
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete book.')
      }
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (ids.length === 0) {
      toast.warning('Please select at least one book to delete')
      return
    }
    if (await confirmToast(Text.Delete_A)) {
      try {
        const numberIds = ids.map((id) => Number(id))
        await deleteMultipleBooks(numberIds)
        toast.success(`${ids.length} book${ids.length !== 1 ? 's' : ''} deleted successfully!`)
        reset()
        setEditId(null)
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete books.')
      } finally {
        setTableKey((prev) => prev + 1)
      }
    }
  }

  const handleAddNew = () => {
    setEditId(null)
    reset()
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    reset()
    setEditId(null)
  }

  const columns = [
    { key: 'bookTitle', label: Text.Book_Title },
    { key: 'description', label: Text.Description },
    { key: 'bookNo', label: Text.Book_Number },
    { key: 'isbnNumber', label: Text.ISBN_Number },
    { key: 'publisher', label: Text.Publisher },
    { key: 'author', label: Text.Author },
    { key: 'subject', label: Text.Subject },
    { key: 'rackNumber', label: Text.Rack_Number },
    { key: 'quantity', label: Text.Qty },
    { key: 'available', label: Text.Available },
    { key: 'price', label: Text.Book_Price },
    { key: 'postDate', label: Text.Post_Date },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Book list data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-4">
      {showForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editId ? 'Edit Book' : Text.Add_Book}
              </h2>
            </div>

            <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} onSchoolChange={reset}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  name="bookTitle"
                  label={Text.Book_Title}
                  control={control}
                  placeholder={Text.Enter_Book_Title}
                  required
                />
                <NumberField
                  name="bookNo"
                  label={Text.Book_Number}
                  control={control}
                  placeholder={Text.Enter_Book_Number}
                  required
                />
                <NumberField
                  name="isbnNumber"
                  label={Text.ISBN_Number}
                  control={control}
                  placeholder={Text.Enter_ISBN_Number}
                  required
                />
                <TextField
                  name="publisher"
                  label={Text.Publisher}
                  control={control}
                  placeholder={Text.Enter_Publisher}
                  required
                />
                <TextField
                  name="author"
                  label={Text.Author}
                  control={control}
                  placeholder={Text.Enter_Author}
                  required
                />
                <TextField
                  name="subject"
                  label={Text.Subject}
                  control={control}
                  placeholder={Text.Enter_Subject}
                  required
                />
                <TextField
                  name="rackNumber"
                  label={Text.Rack_Number}
                  control={control}
                  placeholder={Text.Enter_Rack_Number}
                  required
                />
                <NumberField
                  name="quantity"
                  label={Text.Qty}
                  control={control}
                  placeholder={Text.Enter_Quantity}
                  required
                />
                <Dropdown
                  name="available"
                  label={Text.Available}
                  control={control}
                  options={['Yes', 'No']}
                />
                <NumberField
                  name="price"
                  label={Text.Book_Price}
                  control={control}
                  placeholder={Text.Enter_Book_Price}
                  required
                />
                <DateField name="postDate" label={Text.Post_Date} control={control} />
              </div>

              <div className="mt-4">
                <TextareaField
                  name="description"
                  label={Text.Description}
                  control={control}
                  placeholder="Enter Description"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  name={Text.Cancel}
                  loading={false}
                  icon={<IconField name="FaTimesCircle" size={20} />}
                  onClick={handleCancel}
                />
                <Button
                  name={editId ? Text.Update : Text.Save}
                  loading={isAdding || isUpdating}
                  icon={<IconField name="FaSave" size={20} />}
                  permissionScope="LIBRARY"
                  permissionType={editId ? 'UPDATE' : 'CREATE'}
                  enablePermissions={true}
                />
              </div>
            </AllSchoolDropdown>
          </div>
        </div>
      )}

      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{Text.Book_Lis}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{Text.Manage_your_library_book_collection}</p>
          </div>
          <div className="flex gap-2">
            <ExcelActions
              importMutation={importMutation}
              downloadMutation={downloadMutation}
              importLabel={Text.Import_Book_XL}
              downloadLabel={Text.Download_XL_Template}
            />
          </div>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="mb-4 max-w-sm">
            <TextField
              label={Text.Search}
              name="filterSearch"
              placeholder={Text.Title_ISBN_Publisher_Author}
              control={filterControl}
            />
          </section>
          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={Text.Clear_Filters}
              loading={false}
              icon={<IconField name="FaTimes" size={16} />}
              showAlways={true}
            />
            <Button
              name={Text.Search}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" size={16} />}
              showAlways={true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">{Text.Loading_student_library_data}</span>
            </div>
          )}
          <ControlledTable
            key={tableKey}
            title={Text.Book_Lis}
            columns={columns}
            data={books}
            fullData={books}
            showSearch={false}
            enablePermissions={true}
            permissionScope="LIBRARY"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            btn={true}
            btnName={Text.Add_Book}
            showForm={handleAddNew}
            showSelectAll
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  )
}

export default BookLists