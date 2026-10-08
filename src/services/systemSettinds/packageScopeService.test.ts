import { beforeEach, describe, expect, it, vi } from 'vitest'
import AxiosFunc from '../../utils/axios'
import { packageScopeService } from './packageScopeService'
import { hasScopePermission } from '../../utils/permissions'

vi.mock('../../utils/axios', () => ({
  default: {
    Get: vi.fn(),
  },
}))

describe('packageScopeService', () => {
  beforeEach(() => {
    vi.mocked(AxiosFunc.Get).mockReset()
    const storage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
    })
  })

  it('requests package scopes using the supplied school group code', async () => {
    const data = [{ scope: 'FEES', operations: ['READ', 'CREATE'] }]
    vi.mocked(AxiosFunc.Get).mockResolvedValue({
      data: { status: 200, message: 'Completed successfully.', data },
    } as never)

    await expect(packageScopeService.getForSchoolGroup('SG / 42')).resolves.toEqual(data)
    expect(AxiosFunc.Get).toHaveBeenCalledWith('/school-group/SG%20%2F%2042/package-scopes')
  })

  it('throws the server message for a failed response', async () => {
    vi.mocked(AxiosFunc.Get).mockResolvedValue({
      data: { status: 404, message: 'Invalid school group', data: null },
    } as never)

    await expect(packageScopeService.getForSchoolGroup('missing')).rejects.toThrow(
      'Invalid school group',
    )
  })

  it('limits scope access to package and assigned-role operations', () => {
    localStorage.setItem(
      'packageScopes',
      JSON.stringify([{ scope: 'FEES', operations: ['READ', 'CREATE'] }]),
    )
    localStorage.setItem('crudPermissions', JSON.stringify([{ scope: 'FEES', operations: ['READ'] }]))
    localStorage.setItem('role', 'TEACHER')

    expect(hasScopePermission('FEES', 'READ')).toBe(true)
    expect(hasScopePermission('FEES', 'CREATE')).toBe(false)

    localStorage.setItem('role', 'SCHOOL')
    expect(hasScopePermission('FEES', 'CREATE')).toBe(true)
    expect(hasScopePermission('FEES', 'DELETE')).toBe(false)
  })
})
