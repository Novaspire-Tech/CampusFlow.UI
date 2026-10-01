import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCheck, XCircle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  todaySent: number;
  todayDelivered: number;
  todayFailed: number;
  monthlyTotal: number;
  deliveryRate: number;
  readRate: number;
}

const WhatsAppDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySent: 0,
    todayDelivered: 0,
    todayFailed: 0,
    monthlyTotal: 0,
    deliveryRate: 0,
    readRate: 0,
  });

  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setStats({
          todaySent: 145,
          todayDelivered: 138,
          todayFailed: 7,
          monthlyTotal: 3240,
          deliveryRate: 95.2,
          readRate: 78.5,
        });
        
        setRecentMessages([
          {
            id: '1',
            studentName: 'Rajesh Kumar',
            phoneNumber: '+919876543210',
            templateName: 'Fee Reminder',
            status: 'delivered',
            sentAt: '2024-11-11T10:30:00',
          },
          {
            id: '2',
            studentName: 'Priya Sharma',
            phoneNumber: '+919876543211',
            templateName: 'Exam Schedule',
            status: 'read',
            sentAt: '2024-11-11T10:28:00',
          },
          {
            id: '3',
            studentName: 'Amit Patel',
            phoneNumber: '+919876543212',
            templateName: 'Attendance Alert',
            status: 'sent',
            sentAt: '2024-11-11T10:25:00',
          },
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      sent: { color: 'bg-blue-100 text-blue-800', text: 'Sent' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      read: { color: 'bg-purple-100 text-purple-800', text: 'Read' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      queued: { color: 'bg-yellow-100 text-yellow-800', text: 'Queued' },
    };

    const badge = badges[status] || badges.sent;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor and manage WhatsApp communications</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Send size={18} />
          Send Message
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Messages"
          value={stats.todaySent}
          icon={<Send size={24} className="text-blue-600" />}
          color="bg-blue-50"
          subtitle="Messages sent today"
        />
        <StatCard
          title="Delivered"
          value={stats.todayDelivered}
          icon={<CheckCheck size={24} className="text-green-600" />}
          color="bg-green-50"
          subtitle={`${stats.deliveryRate}% delivery rate`}
        />
        <StatCard
          title="Failed"
          value={stats.todayFailed}
          icon={<XCircle size={24} className="text-red-600" />}
          color="bg-red-50"
          subtitle="Requires attention"
        />
        <StatCard
          title="Monthly Total"
          value={stats.monthlyTotal}
          icon={<TrendingUp size={24} className="text-purple-600" />}
          color="bg-purple-50"
          subtitle="This month"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Delivery Rate</span>
                <span className="text-sm font-semibold text-gray-800">{stats.deliveryRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.deliveryRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Read Rate</span>
                <span className="text-sm font-semibold text-gray-800">{stats.readRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.readRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCheck size={18} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Delivered</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.todayDelivered}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.todaySent - stats.todayDelivered - stats.todayFailed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-600" />
                <span className="text-sm font-medium text-gray-700">Failed</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.todayFailed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Messages</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </a>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentMessages.map((message) => (
            <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{message.studentName}</h4>
                    <p className="text-xs text-gray-600">{message.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{message.templateName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.sentAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {getStatusBadge(message.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDashboard;