import React, { useMemo } from 'react'
import {
  FaBox,
  FaLayerGroup,
  FaCheckCircle,
  FaBan,
  FaRupeeSign,
  FaHourglassHalf,
} from 'react-icons/fa'
import StatsCard from '../../../home/dashboard/superAdmin/Statscard'
import PackagePerformance from '../../../home/dashboard/superAdmin/Packageperformance'
import SuperAdminPieCharts from '../../../home/dashboard/superAdmin/Superadminpiecharts'
import { usePackages } from '../../../../hooks/queries/superAdmin/usePackage'
import { useSchoolGroups } from '../../../../hooks/queries/superAdmin/useschoolGroup'
import { useSubscriptions } from '../../../../hooks/queries/superAdmin/useSubscription'

const fmt = (iso?: string | null): string => {
  if (!iso) return '—'
  try {
    const [datePart] = iso.split(' ')
    const [dd, mm, yyyy] = datePart.split('-')
    return new Date(`${yyyy}-${mm}-${dd}`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

const statusOf = (status: string): 'active' | 'trialing' | 'suspended' | 'other' => {
  const s = (status ?? '').toUpperCase().trim()
  if (s === 'ACTIVE') return 'active'
  if (s === 'TRIALING') return 'trialing'
  if (s === 'SUSPENDED' || s === 'CANCELLED' || s === 'CANCELED') return 'suspended'
  return 'other'
}
const StatSkeleton: React.FC = () => (
  <div className="bg-white border-2 border-gray-100 shadow-sm rounded-xl p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-7 w-16 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="mt-4 h-3 w-full bg-gray-200 rounded-full" />
  </div>
)

interface RecentSub {
  subscriptionId: number
  schoolGroupName: string
  packageCategory: string
  billingPeriod: string
  subscriptionStatus: string
  startDate: string
  amount: number | null
}

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const kind = statusOf(status)
  const styles: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    trialing: 'bg-blue-50  text-blue-700  border-blue-200',
    suspended: 'bg-red-50   text-red-600   border-red-200',
    other: 'bg-gray-100 text-gray-500  border-gray-200',
  }
  return (
    <span
      className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium border ${styles[kind]}`}
    >
      {status}
    </span>
  )
}

const RecentSubscriptions: React.FC<{ rows: RecentSub[]; loading: boolean }> = ({
  rows,
  loading,
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-800">Recent subscriptions</h2>
      <span className="text-xs text-gray-400">{rows.length} shown</span>
    </div>

    {loading ? (
      <div className="px-6 py-8 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    ) : rows.length === 0 ? (
      <p className="px-6 py-8 text-sm text-gray-400 text-center">No subscriptions found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Subscriber', 'Plan', 'Billing', 'Amount', 'Start date', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r) => (
              <tr key={r.subscriptionId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {r.schoolGroupName || '—'}
                </td>
                <td className="px-6 py-3 text-gray-600">{r.packageCategory || '—'}</td>
                <td className="px-6 py-3 text-gray-500">
                  {(r.billingPeriod ?? '').replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-3 text-gray-800 font-medium">
                  {r.amount != null ? `₹${r.amount.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{fmt(r.startDate)}</td>
                <td className="px-6 py-3">
                  <StatusPill status={r.subscriptionStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)

const SuperAdminDashboard: React.FC = () => {
  const { data: packagesData, isLoading: pkgLoading } = usePackages()
  const { data: groupsData, isLoading: grpLoading } = useSchoolGroups({ page: 0, size: 10000 })
  const { data: subData, isLoading: subLoading } = useSubscriptions({ page: 0, size: 10000 })

  const subscriptions = subData?.subscriptions ?? []

  const stats = useMemo(() => {
    let active = 0,
      trialing = 0,
      suspended = 0,
      totalRevenue = 0
    subscriptions.forEach((s: any) => {
      const kind = statusOf(s.subscriptionStatus ?? '')
      if (kind === 'active') active++
      if (kind === 'trialing') trialing++
      if (kind === 'suspended') suspended++
      if (typeof s.amount === 'number') totalRevenue += s.amount
    })
    return { active, trialing, suspended, totalRevenue }
  }, [subscriptions])

  const totalPackages = packagesData?.packages?.length ?? 0
  const totalGroups = groupsData?.totalItems ?? 0
  const totalSubs = subData?.totalItems ?? 0

  // active % for progress bar on active-subs card
  const activeRatio = totalSubs > 0 ? Math.round((stats.active / totalSubs) * 100) : 0

  const recentSubs: RecentSub[] = useMemo(() => {
    return [...subscriptions]
      .sort((a: any, b: any) => {
        const ta = a.startDate ? new Date(a.startDate).getTime() : 0
        const tb = b.startDate ? new Date(b.startDate).getTime() : 0
        return tb - ta
      })
      .slice(0, 10) as RecentSub[]
  }, [subscriptions])

  return (
    <div className="min-h-screen py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pkgLoading ? (
            <StatSkeleton />
          ) : (
            <StatsCard
              title="Total packages"
              value={totalPackages}
              icon={FaBox}
              colorScheme="blue"
              showFullProgress
            />
          )}

          {grpLoading ? (
            <StatSkeleton />
          ) : (
            <StatsCard
              title="School groups"
              value={totalGroups}
              icon={FaLayerGroup}
              colorScheme="purple"
              showFullProgress
            />
          )}

          {subLoading ? (
            <StatSkeleton />
          ) : (
            <StatsCard
              title="Active subscriptions"
              value={stats.active}
              icon={FaCheckCircle}
              colorScheme="green"
              subtitle="of total"
              subtitleValue={totalSubs}
              progress={activeRatio}
            />
          )}

          {subLoading ? (
            <StatSkeleton />
          ) : (
            <StatsCard
              title="Trial subscriptions"
              value={stats.trialing}
              icon={FaHourglassHalf}
              colorScheme="yellow"
              showFullProgress
            />
          )}

          {subLoading ? (
            <StatSkeleton />
          ) : (
            <StatsCard
              title="Suspended"
              value={stats.suspended}
              icon={FaBan}
              colorScheme="red"
              showFullProgress
            />
          )}

          {subLoading ? (
            <StatSkeleton />
          ) : (
            <StatsCard
              title="Total revenue"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              icon={FaRupeeSign}
              colorScheme="indigo"
              showFullProgress
            />
          )}
        </div>

        <SuperAdminPieCharts />

        <PackagePerformance />

        <RecentSubscriptions rows={recentSubs} loading={subLoading} />
      </div>
    </div>
  )
}

export default SuperAdminDashboard
