import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosHeaders, type AxiosResponse } from 'axios'
import AxiosFunc from '../../utils/axios'
import { sessionService } from './SessionSettingServices'
import type { SessionRolloverReport } from '../../types/systemSettinds/SessionSetting'

vi.mock('../../utils/axios', () => ({
  default: {
    Post: vi.fn(),
  },
}))

const report: SessionRolloverReport = {
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

const makeResponse = (data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
})

describe('sessionService.rollover', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => ({ schoolGroupCode: 'group', schoolCode: 'school' })[key] ?? null,
    })
    vi.mocked(AxiosFunc.Post).mockReset()
  })

  it.each([true, false])('converts session ids and passes dryRun=%s unchanged', async (dryRun) => {
    vi.mocked(AxiosFunc.Post).mockResolvedValue(
      makeResponse({ status: 200, message: 'Completed successfully.', data: report }),
    )

    await sessionService.rollover({
      fromSessionId: '12',
      toSessionId: '13',
      classIds: [101, 102],
      dryRun,
      copySections: true,
      copySubjectGroups: false,
      copyExamGroups: true,
      copyClassFees: false,
    })

    expect(AxiosFunc.Post).toHaveBeenCalledWith(
      '/school-group/group/school/school/session/rollover',
      {
        fromSessionId: 12,
        toSessionId: 13,
        classIds: [101, 102],
        dryRun,
        copySections: true,
        copySubjectGroups: false,
        copyExamGroups: true,
        copyClassFees: false,
      },
    )
  })

  it('throws the backend message when the response envelope is unsuccessful', async () => {
    vi.mocked(AxiosFunc.Post).mockResolvedValue(
      makeResponse({
        status: 400,
        message: 'Source and target session must be different',
        data: null,
      }),
    )

    await expect(
      sessionService.rollover({
        fromSessionId: 12,
        toSessionId: 12,
        dryRun: true,
        copySections: true,
        copySubjectGroups: true,
        copyExamGroups: true,
        copyClassFees: true,
      }),
    ).rejects.toThrow('Source and target session must be different')
  })

  it('uses the server message from an HTTP error response', async () => {
    vi.mocked(AxiosFunc.Post).mockRejectedValue({
      response: { data: { status: 404, message: 'Source session not found', data: null } },
    })

    await expect(
      sessionService.rollover({
        fromSessionId: 12,
        toSessionId: 13,
        dryRun: true,
        copySections: true,
        copySubjectGroups: true,
        copyExamGroups: true,
        copyClassFees: true,
      }),
    ).rejects.toThrow('Source session not found')
  })
})
