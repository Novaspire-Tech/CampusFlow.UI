import { useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSchoolClassesBySession } from '../../hooks/queries/academics/useClasses'
import { useRolloverSession } from '../../hooks/queries/systemSettinds/useSessionSetting'
import type {
  Session,
  SessionRolloverReport,
  SessionRolloverRequest,
} from '../../types/systemSettinds/SessionSetting'

interface SessionRolloverDialogProps {
  open: boolean
  sessions: Session[]
  onClose: () => void
  onComplete: (report: SessionRolloverReport) => void
}

type CopyOptions = Pick<
  SessionRolloverRequest,
  'copySections' | 'copySubjectGroups' | 'copyExamGroups' | 'copyClassFees'
>

const initialCopyOptions: CopyOptions = {
  copySections: true,
  copySubjectGroups: true,
  copyExamGroups: true,
  copyClassFees: true,
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'The rollover could not be completed.'

const RolloverReport = ({
  report,
  title,
}: {
  report: SessionRolloverReport
  title: string
}) => {
  const { t } = useTranslation()
  const tr = (key: string, fallback: string, options?: Record<string, unknown>) =>
    t(`pages_data.System_Settings.Session_Setting.Rollover.${key}`, {
      defaultValue: fallback,
      ...options,
    })

  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-4" aria-label={title}>
      <Typography variant="subtitle1" fontWeight={600} className="mb-2">
        {title}
      </Typography>
      <p className="mb-3 text-sm text-gray-700">
        {report.fromSession} → {report.toSession}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <p>{tr('classes', 'Classes')}: {report.copiedClasses.length}</p>
        <p>{tr('sections', 'Sections')}: {report.sectionsCreated}</p>
        <p>{tr('subjectGroups', 'Subject groups')}: {report.subjectGroupsCreated}</p>
        <p>{tr('examGroups', 'Exam groups')}: {report.examGroupsCreated}</p>
        <p>{tr('classFees', 'Class fees')}: {report.classFeesCreated}</p>
      </div>
      {report.copiedClasses.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium">{tr('copiedClasses', 'Classes handled')}</p>
          <ul className="list-inside list-disc text-sm text-gray-700">
            {report.copiedClasses.map((className, index) => (
              <li key={`${className}-${index}`}>{className}</li>
            ))}
          </ul>
        </div>
      )}
      {report.skippedClasses.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium">{tr('skippedClasses', 'Skipped classes')}</p>
          <ul className="list-inside list-disc text-sm text-amber-800">
            {report.skippedClasses.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
      {report.message && (
        <Alert severity={report.dryRun ? 'info' : 'success'} className="mt-3">
          {report.message}
        </Alert>
      )}
    </section>
  )
}

const SessionRolloverDialog = ({
  open,
  sessions,
  onClose,
  onComplete,
}: SessionRolloverDialogProps) => {
  const { t } = useTranslation()
  const tr = (key: string, fallback: string, options?: Record<string, unknown>) =>
    t(`pages_data.System_Settings.Session_Setting.Rollover.${key}`, {
      defaultValue: fallback,
      ...options,
    })
  const currentSession = sessions.find((session) => session.isCurrent)
  const [sourceSessionId, setSourceSessionId] = useState(currentSession?.id ?? '')
  const [targetSessionId, setTargetSessionId] = useState('')
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const [copyOptions, setCopyOptions] = useState<CopyOptions>(initialCopyOptions)
  const [preview, setPreview] = useState<{ key: string; report: SessionRolloverReport } | null>(null)
  const [result, setResult] = useState<{ key: string; report: SessionRolloverReport } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [action, setAction] = useState<'preview' | 'run' | null>(null)
  const submissionLock = useRef(false)

  const sourceSession = sessions.find((session) => session.id === sourceSessionId)
  const targetSession = sessions.find((session) => session.id === targetSessionId)
  const { data: sourceClasses = [], isLoading: isLoadingSourceClasses } =
    useSchoolClassesBySession(sourceSessionId || undefined)
  const { data: targetClasses = [], isLoading: isLoadingTargetClasses } =
    useSchoolClassesBySession(targetSessionId || undefined)
  const rollover = useRolloverSession()

  const request = useMemo<SessionRolloverRequest | null>(() => {
    if (!sourceSession || !targetSession || sourceSessionId === targetSessionId) return null
    const fromSessionId = Number(sourceSession.id)
    const toSessionId = Number(targetSession.id)
    const classIds = selectedClassIds.map(Number)
    if (
      !Number.isFinite(fromSessionId) ||
      !Number.isFinite(toSessionId) ||
      classIds.some((id) => !Number.isFinite(id))
    ) {
      return null
    }

    return {
      fromSessionId,
      toSessionId,
      ...(classIds.length > 0 ? { classIds } : {}),
      dryRun: true,
      ...copyOptions,
    }
  }, [sourceSession, targetSession, sourceSessionId, targetSessionId, selectedClassIds, copyOptions])

  const requestKey = request ? JSON.stringify(request) : ''
  const validPreview = preview?.key === requestKey ? preview : null
  const currentResult = result?.key === requestKey ? result : null
  const targetIsCurrent = targetSession?.isCurrent ?? false
  const isBusy = action !== null

  const previewRollover = async () => {
    if (!request || submissionLock.current) return
    submissionLock.current = true
    setAction('preview')
    setErrorMessage('')
    setPreview(null)
    setResult(null)
    try {
      const report = await rollover.mutateAsync({ ...request, dryRun: true })
      if (!report.dryRun) {
        setErrorMessage(tr('previewWasNotDryRun', 'The server did not confirm a preview. No write is allowed.'))
        return
      }
      setPreview({ key: requestKey, report })
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setAction(null)
      submissionLock.current = false
    }
  }

  const applyRollover = async () => {
    if (!request || !validPreview || submissionLock.current) return
    submissionLock.current = true
    setAction('run')
    setErrorMessage('')
    try {
      const report = await rollover.mutateAsync({ ...request, dryRun: false })
      setResult({ key: requestKey, report })
      setPreview(null)
      setConfirmationOpen(false)
      onComplete(report)
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error))
      setConfirmationOpen(false)
    } finally {
      setAction(null)
      submissionLock.current = false
    }
  }

  const setCopyOption = (key: keyof CopyOptions, checked: boolean) => {
    setCopyOptions((current) => ({ ...current, [key]: checked }))
  }

  const handleClose = () => {
    if (!isBusy) onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="rollover-title">
        <DialogTitle id="rollover-title">
          {tr('dialogTitle', 'Copy structure to another session')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              {tr('description', 'Preview the academic structure before copying it into a different session.')}
            </Typography>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormControl fullWidth>
                <InputLabel id="rollover-source-label">{tr('sourceSession', 'Source session')}</InputLabel>
                <Select
                  labelId="rollover-source-label"
                  label={tr('sourceSession', 'Source session')}
                  value={sourceSessionId}
                  onChange={(event) => {
                    const nextSourceId = event.target.value
                    setSourceSessionId(nextSourceId)
                    setSelectedClassIds([])
                    if (nextSourceId === targetSessionId) setTargetSessionId('')
                  }}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>{session.session}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="rollover-target-label">{tr('targetSession', 'Target session')}</InputLabel>
                <Select
                  labelId="rollover-target-label"
                  label={tr('targetSession', 'Target session')}
                  value={targetSessionId}
                  onChange={(event) => setTargetSessionId(event.target.value)}
                >
                  {sessions
                    .filter((session) => session.id !== sourceSessionId)
                    .map((session) => (
                      <MenuItem key={session.id} value={session.id}>{session.session}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>

            {!targetIsCurrent && targetSession && (
              <Alert severity="warning">
                {tr('targetNotCurrent', 'The target session is not the current active session.')}
              </Alert>
            )}
            {targetClasses.length > 0 && (
              <Alert severity="warning">
                {tr('targetHasClasses', 'This target already has classes. Existing classes may be skipped.')}
                {' '}
                {tr('existingClassCount', '{{count}} class(es) already exist.', { count: targetClasses.length })}
              </Alert>
            )}
            <FormControl fullWidth disabled={!sourceSessionId || isLoadingSourceClasses}>
              <InputLabel id="rollover-classes-label">{tr('classesToCopy', 'Classes to copy')}</InputLabel>
              <Select
                labelId="rollover-classes-label"
                label={tr('classesToCopy', 'Classes to copy')}
                multiple
                value={selectedClassIds}
                onChange={(event) => {
                  const value = event.target.value
                  setSelectedClassIds(typeof value === 'string' ? value.split(',') : value)
                }}
                renderValue={(ids) => {
                  const selectedIds = Array.isArray(ids)
                    ? ids.filter((id): id is string => typeof id === 'string')
                    : []
                  return selectedIds.length === 0
                    ? tr('allClasses', 'All classes')
                    : selectedIds
                        .map((id) => sourceClasses.find((schoolClass) => schoolClass.id === id)?.className ?? id)
                        .join(', ')
                }}
              >
                {sourceClasses.map((schoolClass) => (
                  <MenuItem key={schoolClass.id} value={schoolClass.id}>
                    <Checkbox checked={selectedClassIds.includes(schoolClass.id)} />
                    <ListItemText primary={schoolClass.className} />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" className="mt-1">
                {isLoadingSourceClasses
                  ? tr('loadingClasses', 'Loading source classes…')
                  : tr('allClassesHelper', 'Leave the selection empty to copy every class in the source session.')}
              </Typography>
            </FormControl>

            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <FormControlLabel
                control={<Checkbox checked={copyOptions.copySections} onChange={(_, checked) => setCopyOption('copySections', checked)} />}
                label={tr('copySections', 'Copy sections')}
              />
              <FormControlLabel
                control={<Checkbox checked={copyOptions.copySubjectGroups} onChange={(_, checked) => setCopyOption('copySubjectGroups', checked)} />}
                label={tr('copySubjectGroups', 'Copy subject groups')}
              />
              <FormControlLabel
                control={<Checkbox checked={copyOptions.copyExamGroups} onChange={(_, checked) => setCopyOption('copyExamGroups', checked)} />}
                label={tr('copyExamGroups', 'Copy exam groups')}
              />
              <FormControlLabel
                control={<Checkbox checked={copyOptions.copyClassFees} onChange={(_, checked) => setCopyOption('copyClassFees', checked)} />}
                label={tr('copyClassFees', 'Copy class fees')}
              />
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <p>{tr('examGroupsHelper', 'Exam groups copy their name and description only; exam dates are not copied.')}</p>
              <p>{tr('classFeesHelper', 'Class fees copy the amount and fee type.')}</p>
              <p>{tr('subjectGroupsHelper', 'Subject groups reuse the same subjects.')}</p>
            </div>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {currentResult && (
              <RolloverReport report={currentResult.report} title={tr('resultTitle', 'Rollover result')} />
            )}
            {validPreview && (
              <>
                <RolloverReport report={validPreview.report} title={tr('previewTitle', 'Preview only — nothing is written')} />
                <Alert severity="info">
                  {tr('rerunSafe', 'Re-running is safe: classes that already exist in the target session are skipped.')}
                </Alert>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={handleClose} disabled={isBusy} color="inherit">
            {tr('cancel', 'Cancel')}
          </Button>
          <Button
            onClick={() => void previewRollover()}
            disabled={!request || isBusy || isLoadingSourceClasses || isLoadingTargetClasses}
            variant="outlined"
          >
            {action === 'preview' ? tr('previewing', 'Previewing…') : tr('previewButton', 'Preview only — nothing is written')}
          </Button>
          <Button
            onClick={() => setConfirmationOpen(true)}
            disabled={!validPreview || isBusy}
            variant="contained"
            color="warning"
          >
            {tr('runButton', 'Run rollover')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmationOpen}
        onClose={() => !isBusy && setConfirmationOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="rollover-confirm-title"
      >
        <DialogTitle id="rollover-confirm-title">{tr('confirmTitle', 'Confirm structure copy')}</DialogTitle>
        <DialogContent dividers>
          {validPreview && (
            <Stack spacing={2}>
              <Alert severity="warning">
                {tr('confirmDescription', 'This will write the following structure to the target session. Re-running is safe; existing classes will be skipped.')}
              </Alert>
              <RolloverReport report={validPreview.report} title={`${validPreview.report.fromSession} → ${validPreview.report.toSession}`} />
            </Stack>
          )}
          {errorMessage && <Alert severity="error" className="mt-3">{errorMessage}</Alert>}
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={() => setConfirmationOpen(false)} disabled={isBusy} color="inherit">
            {tr('cancel', 'Cancel')}
          </Button>
          <Button
            onClick={() => void applyRollover()}
            disabled={!validPreview || isBusy}
            variant="contained"
            color="error"
          >
            {action === 'run' ? tr('copying', 'Copying…') : tr('copyStructure', 'Copy structure')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SessionRolloverDialog
