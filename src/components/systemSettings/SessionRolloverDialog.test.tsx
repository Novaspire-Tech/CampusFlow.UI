import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SessionRolloverDialog from './SessionRolloverDialog'
import type { Session, SessionRolloverReport } from '../../types/systemSettinds/SessionSetting'

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }))

vi.mock('../../hooks/queries/systemSettinds/useSessionSetting', () => ({
  useRolloverSession: () => ({ mutateAsync }),
}))

vi.mock('../../hooks/queries/academics/useClasses', () => ({
  useSchoolClassesBySession: (sessionId?: string) => ({
    data: sessionId === '12'
      ? [{ id: '101', schoolClassId: 101, className: 'Class 1', name: 'Class 1', sections: [] }]
      : [],
    isLoading: false,
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: string | { defaultValue?: string; count?: number }) =>
      typeof options === 'string' ? options : options?.defaultValue ?? _key,
  }),
}))

const sessions: Session[] = [
  {
    id: '12',
    sessionId: '12',
    session: '2025-2026',
    sessionName: '2025-2026',
    isCurrent: true,
    startDate: '',
    endDate: null,
  },
  {
    id: '13',
    sessionId: '13',
    session: '2026-2027',
    sessionName: '2026-2027',
    isCurrent: false,
    startDate: '',
    endDate: null,
  },
]

const previewReport: SessionRolloverReport = {
  fromSessionId: 12,
  fromSession: '2025-2026',
  toSessionId: 13,
  toSession: '2026-2027',
  dryRun: true,
  copiedClasses: ['Class 1'],
  skippedClasses: [],
  sectionsCreated: 1,
  subjectGroupsCreated: 1,
  examGroupsCreated: 0,
  classFeesCreated: 2,
  message: 'Dry run - nothing was written',
}

describe('SessionRolloverDialog preview gating', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockImplementation(async (request) =>
      request.dryRun ? previewReport : { ...previewReport, dryRun: false, message: 'Rollover completed' },
    )
  })

  it('enables the write confirmation only after preview succeeds and uses an explicit real-run flag', async () => {
    render(
      <SessionRolloverDialog
        open
        sessions={sessions}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    const runButton = screen.getByRole('button', { name: 'Run rollover' })
    expect(runButton).toBeDisabled()
    expect(mutateAsync).not.toHaveBeenCalled()

    fireEvent.mouseDown(screen.getAllByRole('combobox')[1])
    const targetOption = await screen.findByRole('option', { name: '2026-2027' })
    fireEvent.click(targetOption)
    fireEvent.click(screen.getByRole('button', { name: 'Preview only — nothing is written' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        fromSessionId: 12,
        toSessionId: 13,
        dryRun: true,
        copySections: true,
        copySubjectGroups: true,
        copyExamGroups: true,
        copyClassFees: true,
      })
    })
    expect(await screen.findByText('Dry run - nothing was written')).toBeInTheDocument()
    expect(runButton).toBeEnabled()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Copy sections' }))
    expect(runButton).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Preview only — nothing is written' }))
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenLastCalledWith({
        fromSessionId: 12,
        toSessionId: 13,
        dryRun: true,
        copySections: false,
        copySubjectGroups: true,
        copyExamGroups: true,
        copyClassFees: true,
      })
    })
    expect(runButton).toBeEnabled()

    fireEvent.click(runButton)
    const confirmation = await screen.findByRole('dialog', { name: 'Confirm structure copy' })
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Copy structure' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenLastCalledWith({
        fromSessionId: 12,
        toSessionId: 13,
        dryRun: false,
        copySections: false,
        copySubjectGroups: true,
        copyExamGroups: true,
        copyClassFees: true,
      })
    })
  }, 15000)
})
