import React, { useState } from 'react';
import { Search, Download, CheckCheck, Clock, XCircle, Eye } from 'lucide-react';

interface Message {
  id: string;
  studentName: string;
  phoneNumber: string;
  templateName: string;
  messageContent: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sentBy: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
}

const MessageHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Mock data
  const messages: Message[] = [
    {
      id: '1',
      studentName: 'Rajesh Kumar',
      phoneNumber: '+919876543210',
      templateName: 'Fee Reminder',
      messageContent: 'Dear Rajesh Kumar, your fee payment of ₹5000 is due on 15th March.',
      status: 'read',
      sentBy: 'Admin',
      sentAt: '2024-11-11T10:30:00',
      deliveredAt: '2024-11-11T10:30:15',
      readAt: '2024-11-11T10:32:00',
    },
    {
      id: '2',
      studentName: 'Priya Sharma',
      phoneNumber: '+919876543211',
      templateName: 'Exam Schedule',
      messageContent: 'Hello Priya Sharma, your Math exam is scheduled on 20th March at 10:00 AM.',
      status: 'delivered',
      sentBy: 'Principal',
      sentAt: '2024-11-11T10:28:00',
      deliveredAt: '2024-11-11T10:28:20',
    },
    {
      id: '3',
      studentName: 'Amit Patel',
      phoneNumber: '+919876543212',
      templateName: 'Attendance Alert',
      messageContent: 'Dear Parent, Amit Patel was absent on 10th Nov. Current attendance: 85%.',
      status: 'sent',
      sentBy: 'Teacher - Class 10A',
      sentAt: '2024-11-11T10:25:00',
    },
    {
      id: '4',
      studentName: 'Neha Gupta',
      phoneNumber: '+919876543213',
      templateName: 'Fee Reminder',
      messageContent: 'Dear Neha Gupta, your fee payment of ₹5000 is due on 15th March.',
      status: 'failed',
      sentBy: 'Admin',
      sentAt: '2024-11-11T10:20:00',
      errorMessage: 'Invalid phone number',
    },
    {
      id: '5',
      studentName: 'Arjun Singh',
      phoneNumber: '+919876543214',
      templateName: 'Result Announcement',
      messageContent: 'Congratulations Arjun Singh! Your exam results are now available.',
      status: 'read',
      sentBy: 'Exam Controller',
      sentAt: '2024-11-11T09:45:00',
      deliveredAt: '2024-11-11T09:45:10',
      readAt: '2024-11-11T09:50:00',
    },
  ];

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      sent: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Sent', icon: <Clock size={14} /> },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Delivered', icon: <CheckCheck size={14} /> },
      read: { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Read', icon: <CheckCheck size={14} /> },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Failed', icon: <XCircle size={14} /> },
      queued: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Queued', icon: <Clock size={14} /> },
    };

    const badge = badges[status] || badges.sent;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MessageDetailModal: React.FC<{ message: Message; onClose: () => void }> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Message Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <div className="mt-2">{getStatusBadge(message.status)}</div>
          </div>

          {/* Recipient */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Student Name</label>
              <p className="text-sm text-gray-800 font-medium mt-1">{message.studentName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Phone Number</label>
              <p className="text-sm text-gray-800 font-medium mt-1">{message.phoneNumber}</p>
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="text-xs font-medium text-gray-600">Template Used</label>
            <p className="text-sm text-gray-800 font-medium mt-1">{message.templateName}</p>
          </div>

          {/* Message Content */}
          <div>
            <label className="text-xs font-medium text-gray-600">Message Content</label>
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.messageContent}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="text-xs font-medium text-gray-600">Timeline</label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Sent</p>
                  <p className="text-xs text-gray-600">{formatTimestamp(message.sentAt)}</p>
                  <p className="text-xs text-gray-500">By {message.sentBy}</p>
                </div>
              </div>
              
              {message.deliveredAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCheck size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Delivered</p>
                    <p className="text-xs text-gray-600">{formatTimestamp(message.deliveredAt)}</p>
                  </div>
                </div>
              )}
              
              {message.readAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCheck size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Read</p>
                    <p className="text-xs text-gray-600">{formatTimestamp(message.readAt)}</p>
                  </div>
                </div>
              )}
              
              {message.errorMessage && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Failed</p>
                    <p className="text-xs text-red-600">{message.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Message History</h1>
          <p className="text-sm text-gray-600 mt-1">View and track all sent WhatsApp messages</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{messages.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {messages.filter(m => m.status === 'delivered' || m.status === 'read').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCheck size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Read</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {messages.filter(m => m.status === 'read').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCheck size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {messages.filter(m => m.status === 'failed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Template
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sent By
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{message.studentName}</p>
                      <p className="text-xs text-gray-600">{message.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{message.templateName}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(message.status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{message.sentBy}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800">{formatTimestamp(message.sentAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="p-12 text-center">
            <Search className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No messages found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredMessages.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredMessages.length} of {messages.length} messages
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />
      )}
    </div>
  );
};

export default MessageHistory;