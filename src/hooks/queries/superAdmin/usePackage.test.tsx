import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { packageService } from '../../../services/superAdmin/packageServices'
import { useAllPackages, useBestSellingPackages } from './usePackage'

describe('useAllPackages', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('waits until enabled before fetching the full package list', async () => {
    const getAllPages = vi.spyOn(packageService, 'getAllPages').mockResolvedValue({
      packages: [],
      currentPage: 0,
      size: 10,
      totalItems: 0,
      totalPages: 0,
    })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { rerender } = renderHook(({ enabled }) => useAllPackages(enabled), {
      initialProps: { enabled: false },
      wrapper,
    })

    expect(getAllPages).not.toHaveBeenCalled()

    rerender({ enabled: true })
    await waitFor(() => expect(getAllPages).toHaveBeenCalledTimes(1))

    queryClient.clear()
  })

  it('does not request best-selling packages when the backend is unavailable', () => {
    const getBestSelling = vi.spyOn(packageService, 'getBestSelling')
    const queryClient = new QueryClient()
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useBestSellingPackages(false), { wrapper })

    expect(getBestSelling).not.toHaveBeenCalled()
    queryClient.clear()
  })
})
