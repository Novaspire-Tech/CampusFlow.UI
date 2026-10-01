import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button, TextField } from '../../../components/controlled'
import { IconField } from '../../../components'
import { feeTransactionService } from '../../../services/feesCollection/feeTransactionService'
import type { FeeTransactionDto } from '../../../types/feesCollection/searchDueFeesType'

interface LookupFormData {
  transactionId: string
}

const DeleteFeeTransactionById: React.FC = () => {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupFormData>({ defaultValues: { transactionId: '' } })

  const [record, setRecord] = useState<FeeTransactionDto | null>(null)
  const [isLoadingRecord, setIsLoadingRecord] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const onLookup: SubmitHandler<LookupFormData> = async (data) => {
    const id = data.transactionId.trim()
    if (!id) return
    console.log('Lookup ID:', id)

    setIsLoadingRecord(true)
    setNotFound(false)
    setRecord(null)
    try {
      const tx = await feeTransactionService.getById(id)
      setRecord(tx)
    } catch (err: any) {
      console.error('Error fetching transaction:', err)
      setNotFound(true)
    } finally {
      setIsLoadingRecord(false)
    }
  }

  const handleDelete = async () => {
    if (!record?.feeTransactionId) return

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete transaction #${record.feeTransactionId} (₹${record.amount}) for ${record.studentName || 'this student'}? This cannot be undone.`,
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await feeTransactionService.delete(String(record.feeTransactionId))
      toast.success(`Transaction #${record.feeTransactionId} deleted successfully.`)
      navigate('/search-fees-payment', { state: { refreshedAt: Date.now() } })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete transaction.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex justify-center px-2 sm:px-4 md:px-6 mt-10 w-full">
      <div className="w-full max-w-2xl border border-gray-300 bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Delete Fee Transaction by ID</h2>
          <Button
            name="Back"
            type="button"
            icon={<IconField name="FaArrowLeft" size={14} />}
            onClick={() => navigate('/search-fees-payment', { state: { refreshedAt: Date.now() } })}
            loading={false}
            showAlways={true}
          />
        </div>

        <div className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TextField
                label="Transaction ID"
                name="transactionId"
                control={control}
                required
                placeholder="Enter fee transaction ID"
                rules={{ required: 'Transaction ID is required' }}
              />
              {errors.transactionId && (
                <span className="text-xs text-red-500">{errors.transactionId.message}</span>
              )}
            </div>
            <Button
              name={isLoadingRecord ? 'Searching…' : 'Find'}
              loading={isLoadingRecord}
              type="button"
              icon={<IconField name="FaSearch" size={14} />}
              onClick={handleSubmit(onLookup)}
              showAlways={true}
            />
          </div>

          {notFound && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              No transaction found with that ID.
            </div>
          )}

          {record && (
            <div className="mt-5 border border-gray-200 rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Transaction Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Transaction ID</dt>
                <dd>{record.feeTransactionId}</dd>

                <dt className="text-gray-500">Student</dt>
                <dd>{record.studentName || 'N/A'}</dd>

                <dt className="text-gray-500">Admission No</dt>
                <dd>{record.admissionNo || 'N/A'}</dd>

                <dt className="text-gray-500">Class / Section</dt>
                <dd>
                  {record.className || 'N/A'} {record.sectionName ? `- ${record.sectionName}` : ''}
                </dd>

                <dt className="text-gray-500">Fee Type</dt>
                <dd>{record.feeTypeName || 'N/A'}</dd>

                <dt className="text-gray-500">Date</dt>
                <dd>{record.date}</dd>

                <dt className="text-gray-500">Mode</dt>
                <dd>{record.mode}</dd>

                <dt className="text-gray-500">Amount Paid</dt>
                <dd>₹{Number(record.amount || 0).toFixed(2)}</dd>

                <dt className="text-gray-500">Discount</dt>
                <dd>₹{Number(record.discountAmount || 0).toFixed(2)}</dd>

                <dt className="text-gray-500">Fine</dt>
                <dd>₹{Number(record.fine || 0).toFixed(2)}</dd>

                <dt className="text-gray-500">Receipt No</dt>
                <dd>{record.receiptNo || 'N/A'}</dd>
              </dl>

              <div className="flex justify-end mt-4">
                <Button
                  name={isDeleting ? 'Deleting…' : 'Delete Transaction'}
                  loading={isDeleting}
                  type="button"
                  icon={<IconField name="FaTrashAlt" size={14} color="white" />}
                  onClick={handleDelete}
                  showAlways={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeleteFeeTransactionById
