import { useState } from 'react'
import {
  FaClock,
  FaFilter,
  FaUserCheck,
  FaEnvelope,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaBoxOpen,
  FaInbox,
} from 'react-icons/fa'
import type { ActivityItem } from '../../../home/dashboard/receptionist/receptiontypes'
import type { JSX } from 'react/jsx-runtime'

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const getIconColor = (type: string): string => {
  const colors: Record<string, string> = {
    visitor: '#3b82f6',
    enquiry: '#10b981',
    call: '#8b5cf6',
    complaint: '#f59e0b',
    dispatch: '#6366f1',
    receive: '#14b8a6',
  }
  return colors[type] || '#64748b'
}

const getStatusStyle = (status?: string) => {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    ongoing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    incoming: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    outgoing: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-500' },
    received: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  }
  return (
    map[status?.toLowerCase() || ''] || {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    }
  )
}

const typeLabel: Record<string, string> = {
  visitor: 'Visitor',
  enquiry: 'Enquiry',
  call: 'Call',
  complaint: 'Complaint',
  dispatch: 'Dispatch',
  receive: 'Receive',
}

const typeIcon: Record<string, JSX.Element> = {
  visitor: <FaUserCheck />,
  enquiry: <FaEnvelope />,
  call: <FaPhoneAlt />,
  complaint: <FaExclamationTriangle />,
  dispatch: <FaBoxOpen />,
  receive: <FaInbox />,
}

const formatTime = (time: string) => {
  try {
    const [day, month, year] = time.split('/')
    const date = new Date(`${year}-${month}-${day}`)
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff}d ago`
    return time
  } catch {
    return time
  }
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const [filter, setFilter] = useState<string>('all')

  const filtered = (
    filter === 'all' ? activities : activities.filter((a) => a.type === filter)
  ).slice(0, 5) // hamesha sirf pehle 5

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Activity Feed</h3>
          <p className="text-xs text-slate-400 mt-0.5">Recent activities</p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer text-slate-700 font-medium"
          >
            <option value="all">All Activities</option>
            <option value="visitor">Visitors</option>
            <option value="enquiry">Enquiries</option>
            <option value="call">Calls</option>
            <option value="complaint">Complaints</option>
            <option value="dispatch">Dispatches</option>
            <option value="receive">Receives</option>
          </select>
          <FaFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                Type
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Title
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Description
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Date
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-3 pr-5">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((activity) => {
                const color = getIconColor(activity.type)
                const status = getStatusStyle(activity.status)
                return (
                  <tr
                    key={activity.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150"
                  >
                    {/* Type */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                          style={{ background: `${color}15`, color }}
                        >
                          {typeIcon[activity.type]}
                        </div>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
                          style={{ background: `${color}10`, color }}
                        >
                          {typeLabel[activity.type] || activity.type}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                        {activity.title}
                      </p>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-3">
                      <p className="text-xs text-slate-500 truncate max-w-[220px]">
                        {activity.description}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                        <FaClock className="text-[9px]" />
                        {formatTime(activity.time)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 pr-5">
                      {activity.status && (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${status.bg} ${status.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {activity.status}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                      <FaClock className="text-slate-300 text-xl" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No activities found</p>
                    <p className="text-xs text-slate-300">Activities will appear here</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivityFeed
