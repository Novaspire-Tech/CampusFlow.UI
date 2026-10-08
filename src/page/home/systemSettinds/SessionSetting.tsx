import { useEffect, useState } from 'react'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { useForm, type SubmitHandler } from 'react-hook-form'
import TextField from '../../../components/controlled/TextField'
import DateField from '../../../components/controlled/DateField'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import {
  useSessions,
  useAddSession,
  useUpdateSession,
  useDeleteSession,
  useDeleteMultipleSessions,
  useChangeCurrentSession,
} from '../../../hooks/queries/systemSettinds/useSessionSetting'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'
import SessionRolloverDialog from '../../../components/systemSettings/SessionRolloverDialog'

type FormValues = {
  Session: string
  startDate: string
  endDate: string
}

function SessionSetting() {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const [search, setSearch] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [rolloverOpen, setRolloverOpen] = useState(false)
  const [rolloverSchoolReady, setRolloverSchoolReady] = useState(
    () => localStorage.getItem('isAllSchools') !== 'true' && Boolean(localStorage.getItem('schoolCode')),
  )

  const { handleSubmit, control, reset, setValue } = useForm<FormValues>({
    defaultValues: { Session: '', startDate: '', endDate: '' },
  })

  const { data: sessions = [] } = useSessions()
  const addSession = useAddSession()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()
  const deleteMultipleSessions = useDeleteMultipleSessions()
  const changeCurrentSession = useChangeCurrentSession()

  useEffect(() => {
    const updateSchoolSelection = () => {
      setRolloverSchoolReady(
        localStorage.getItem('isAllSchools') !== 'true' && Boolean(localStorage.getItem('schoolCode')),
      )
    }
    window.addEventListener('schoolCodeChanged', updateSchoolSelection)
    return () => window.removeEventListener('schoolCodeChanged', updateSchoolSelection)
  }, [])

  const currentSession = sessions.find((s) => s.isCurrent)

  const editingSession = editId ? sessions.find((s) => s.sessionId.toString() === editId) : null

  const handleEdit = (id: string | number) => {
    const item = sessions.find((s) => s.sessionId.toString() === id.toString())
    if (item) {
      setEditId(item.sessionId.toString())
      setValue('Session', item.session)
      setValue('startDate', item.startDate)
      setValue('endDate', item.endDate ?? '')
    }
  }

  const handleDelete = async (id: string | number) => {
    if (await confirmToast(texts.Do_you_want_to_delete_this_entry)) {
      deleteSession.mutate(id.toString(), {
        onSuccess: () => {
          setSuccessMessage('Session deleted successfully')
          setTimeout(() => setSuccessMessage(''), 3000)
        },
        onError: (error: any) => {
          setErrorMessage(error.message || 'Failed to delete session')
          setTimeout(() => setErrorMessage(''), 3000)
        },
      })
    }
  }

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (await confirmToast(texts.Delete_A)) {
      deleteMultipleSessions.mutate(ids.map(String), {
        onSuccess: () => {
          setSuccessMessage('Sessions deleted successfully')
          setTimeout(() => setSuccessMessage(''), 3000)
        },
        onError: (error: any) => {
          setErrorMessage(error.message || 'Failed to delete sessions')
          setTimeout(() => setErrorMessage(''), 3000)
        },
      })
    }
  }

  const handleChangeCurrentSession = async (id: string | number) => {
    const item = sessions.find((s) => s.sessionId.toString() === id.toString())
    if (!item) return

    if (item.isCurrent) {
      setErrorMessage('This session is already set as current.')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    if (
      await confirmToast(
        `Set "${item.session}" as the current active session? This will deactivate the existing current session.`,
      )
    ) {
      changeCurrentSession.mutate(item.sessionId.toString(), {
        onSuccess: () => {
          setSuccessMessage(`"${item.session}" is now the active session.`)
          setTimeout(() => setSuccessMessage(''), 3000)
        },
        onError: (error: any) => {
          setErrorMessage(error.message || 'Failed to change current session')
          setTimeout(() => setErrorMessage(''), 3000)
        },
      })
    }
  }

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setSuccessMessage('')
    setErrorMessage('')

    if (editId) {
      updateSession.mutate(
        {
          id: editId,
          data: {
            session: data.Session,
            startDate: data.startDate,
            endDate: data.endDate || null,
          },
        },
        {
          onSuccess: () => {
            setSuccessMessage(texts.Session_updated_successfully || 'Session updated successfully')
            reset()
            setEditId(null)
            setTimeout(() => setSuccessMessage(''), 3000)
          },
          onError: (error: any) => {
            setErrorMessage(error.message || 'Failed to update session')
            setTimeout(() => setErrorMessage(''), 3000)
          },
        },
      )
    } else {
      addSession.mutate(
        {
          session: data.Session,
          startDate: data.startDate,
          endDate: data.endDate || null,
        },
        {
          onSuccess: () => {
            setSuccessMessage(texts.Session_added_successfully || 'Session added successfully')
            reset()
            setTimeout(() => setSuccessMessage(''), 3000)
          },
          onError: (error: any) => {
            setErrorMessage(error.message || 'Failed to add session')
            setTimeout(() => setErrorMessage(''), 3000)
          },
        },
      )
    }
  }

  const filteredData = sessions
    .filter((item) => item.session.toLowerCase().startsWith(search.toLowerCase()))
    .map((item) => ({
      id: item.sessionId,
      Session: item.session,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      isCurrent: item.isCurrent,
    }))

  const columns = [
    { key: 'Session', label: texts.Session || 'Session' },
    { key: 'startDate', label: texts.Start_Date || 'Start Date' },
    { key: 'endDate', label: texts.End_Date || 'End Date' },
    { key: 'isCurrent', label: texts.Is_Current },
  ]

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setRolloverOpen(true)}
          disabled={!rolloverSchoolReady}
          className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t('pages_data.System_Settings.Session_Setting.Rollover.entryButton', {
            defaultValue: 'Copy structure to another session',
          })}
        </button>
      </div>
      {!rolloverSchoolReady && (
        <p className="mb-6 text-right text-sm text-amber-800">
          {t('pages_data.System_Settings.Session_Setting.Rollover.selectSchoolFirst', {
            defaultValue: 'Select a school before starting a session rollover.',
          })}
        </p>
      )}
      {rolloverOpen && (
        <SessionRolloverDialog
          open={rolloverOpen}
          sessions={sessions}
          onClose={() => setRolloverOpen(false)}
          onComplete={(report) => {
            setSuccessMessage(report.message || 'Session structure copied successfully.')
            setErrorMessage('')
          }}
        />
      )}
      {currentSession && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-md px-4 py-3 mb-6 text-sm">
          <IconField name="FaExclamationTriangle" size={16} />
          <span>
            <strong>{texts.Active_session}:</strong> {currentSession.session} — {texts.changing_or_deleting_the_active_session_may_affect_student_records_and_class_assignments}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white shadow-md rounded-md p-4 sm:p-6">
          {editId && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-4">
              <span className="text-sm text-blue-700">
                {editingSession?.isCurrent
                  ? ''
                  : `Set "${editingSession?.session ?? ''}" as the active session`}
              </span>
              <button
                type="button"
                disabled={editingSession?.isCurrent || changeCurrentSession.isPending}
                onClick={() => editId && handleChangeCurrentSession(editId)}
                className="ml-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md
                           bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconField name="FaCheck" size={12} />
                {changeCurrentSession.isPending ? texts.Update : texts.Set_as_Current }
              </button>
            </div>
          )}

          <h1 className="text-xl font-semibold mb-4">
            {editId ? texts.Edit_Session || 'Edit Session' : texts.Add_Session || texts.Add_Session}
          </h1>

          {successMessage && (
            <div className="bg-green-200 text-green-800 p-2 mb-4 rounded text-sm">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-200 text-red-800 p-2 mb-4 rounded text-sm">{errorMessage}</div>
          )}

          <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="Session"
              label={texts.Session || 'Session'}
              control={control}
              required
              placeholder="e.g., 2023-2024"
            />
            <DateField
              name="startDate"
              label={texts.Start_Date || 'Start Date'}
              control={control}
              required
            />
            <DateField
              name="endDate"
              label={texts.End_Date || 'End Date'}
              control={control}
              defaultToday={false}
            />
            <div className="flex justify-end gap-2">
              {editId && (
                <Button
                  name={texts.Cancel || 'Cancel'}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  onClick={() => {
                    reset()
                    setEditId(null)
                    setErrorMessage('')
                  }}
                />
              )}
              <Button
                name={editId ? texts.Update || 'Update' : texts.Save || 'Save'}
                loading={addSession.isPending || updateSession.isPending}
                icon={<IconField name="FaSave" size={20} />}
              />
            </div>
          </AllSchoolDropdown>
        </div>

        {/* TABLE */}
        <div className="w-full">
          <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm border border-blue-300">
            <strong>{texts.Note || 'Note'}:</strong>{' '}
            {texts.Changing_the_session_name_format_may_cause_issues_on_some_pages_or_features_so_it_is_recommended_not_to_change_the_session_name_format ||
              'Changing the session name format may cause issues on some pages or features, so it is recommended not to change the session name format.'}
          </div>

          <ControlledTable
            title={texts.Session_List || 'Session List'}
            columns={columns}
            data={filteredData}
            searchTerm={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onDeleteMultiple={handleDeleteMultiple}
            showSelectAll
            btn={false}
            showForm={() => {}}
            enablePermissions={true}
            permissionScope="SESSION_SETTING"
          />
        </div>
      </div>
    </div>
  )
}

export default SessionSetting
