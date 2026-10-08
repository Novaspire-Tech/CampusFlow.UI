import { beforeEach, describe, expect, it, vi } from 'vitest'
import AxiosFunc from '../../utils/axios'
import { packageService } from './packageServices'

vi.mock('../../utils/axios', () => ({
  default: {
    Get: vi.fn(),
  },
}))

describe('packageService.getBestSelling', () => {
  beforeEach(() => {
    vi.mocked(AxiosFunc.Get).mockReset()
  })

  it('maps package details from ranked best-selling results', async () => {
    vi.mocked(AxiosFunc.Get).mockResolvedValue({
      data: {
        status: 200,
        data: [
          {
            rank: 1,
            salesCount: 8,
            packageDetails: {
              packageId: 3,
              name: 'Premium',
              description: 'All school features',
              basePrice: 1200,
              billingPeriod: 'MONTHLY',
              packageDays: 30,
              trialDays: 7,
              setupFee: 0,
              recommended: true,
              features: [
                {
                  packageFeatureId: 15,
                  featureCode: 'FEES',
                  featureName: 'Fee management',
                  description: 'Manage school fees',
                  scope: 'FEES',
                  operations: ['READ'],
                  limitType: 'NONE',
                  limitValue: 0,
                  isEnabled: true,
                },
              ],
            },
          },
        ],
      },
    } as never)

    await expect(packageService.getBestSelling()).resolves.toEqual([
      expect.objectContaining({
        packageId: 3,
        name: 'Premium',
        description: 'All school features',
        basePrice: 1200,
        features: [
          expect.objectContaining({
            packageFeatureId: 15,
            featureName: 'Fee management',
            packageFeatureCode: 'FEES',
          }),
        ],
      }),
    ])

    expect(AxiosFunc.Get).toHaveBeenCalledWith(
      '/packages/best-selling',
      undefined,
      { _skipAuthRedirect: true },
    )
  })

  it('rejects malformed best-selling entries instead of rendering an empty package', async () => {
    vi.mocked(AxiosFunc.Get).mockResolvedValue({
      data: { status: 200, data: [{ rank: 1, salesCount: 1 }] },
    } as never)

    await expect(packageService.getBestSelling()).rejects.toThrow(
      'Best-selling package details are missing',
    )
  })
})
