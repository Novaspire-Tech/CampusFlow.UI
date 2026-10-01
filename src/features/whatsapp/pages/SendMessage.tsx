// File: src/features/whatsapp/pages/SendMessage.tsx
import React, { useState } from 'react';
import { Send, Users, User, Search, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  phoneNumber: string;
  className: string;
  section: string;
  rollNumber: string;
}

interface Template {
  id: string;
  name: string;
  body: string;
  parameters: string[];
  category: string;
}

const SendMessage: React.FC = () => {
  const [sendMode, setSendMode] = useState<'individual' | 'bulk'>('individual');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data - Templates
  const templates: Template[] = [
    {
      id: '1',
      name: 'fee_reminder',
      body: 'Dear {studentName}, your fee payment of ₹{amount} is due on {dueDate}. Please pay at the earliest. Thank you.',
      parameters: ['studentName', 'amount', 'dueDate'],
      category: 'Fee Reminder',
    },
    {
      id: '2',
      name: 'exam_schedule',
      body: 'Hello {studentName}, your {examName} exam is scheduled on {date} at {time}. Please be present 15 minutes early.',
      parameters: ['studentName', 'examName', 'date', 'time'],
      category: 'Exam Schedule',
    },
    {
      id: '3',
      name: 'attendance_alert',
      body: 'Dear Parent, {studentName} was absent on {date}. Current attendance: {percentage}%. Please ensure regular attendance.',
      parameters: ['studentName', 'date', 'percentage'],
      category: 'Attendance Alert',
    },
    {
      id: '4',
      name: 'result_notification',
      body: 'Congratulations {studentName}! Your {examName} results are now available. Please check the portal.',
      parameters: ['studentName', 'examName'],
      category: 'Result Notification',
    },
  ];

  // Mock data - Students
  const students: Student[] = [
    { id: '1', name: 'Rajesh Kumar', phoneNumber: '+919876543210', className: '10', section: 'A', rollNumber: '101' },
    { id: '2', name: 'Priya Sharma', phoneNumber: '+919876543211', className: '10', section: 'A', rollNumber: '102' },
    { id: '3', name: 'Amit Patel', phoneNumber: '+919876543212', className: '10', section: 'B', rollNumber: '103' },
    { id: '4', name: 'Neha Gupta', phoneNumber: '+919876543213', className: '11', section: 'A', rollNumber: '104' },
    { id: '5', name: 'Arjun Singh', phoneNumber: '+919876543214', className: '11', section: 'B', rollNumber: '105' },
    { id: '6', name: 'Sneha Reddy', phoneNumber: '+919876543215', className: '10', section: 'A', rollNumber: '106' },
    { id: '7', name: 'Vikram Mehta', phoneNumber: '+919876543216', className: '10', section: 'B', rollNumber: '107' },
    { id: '8', name: 'Pooja Nair', phoneNumber: '+919876543217', className: '11', section: 'A', rollNumber: '108' },
  ];

  const classes = ['all', '10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phoneNumber.includes(searchQuery);
    const matchesClass = classFilter === 'all' || `${student.className}-${student.section}` === classFilter;
    return matchesSearch && matchesClass;
  });

  const toggleStudentSelection = (student: Student) => {
    setSelectedStudents((prev) => {
      const exists = prev.find((s) => s.id === student.id);
      if (exists) {
        return prev.filter((s) => s.id !== student.id);
      }
      return [...prev, student];
    });
  };

  const selectAllVisible = () => {
    setSelectedStudents(filteredStudents);
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const handleSendMessage = async () => {
    if (!selectedTemplate || selectedStudents.length === 0) return;

    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedStudents([]);
        setParameters({});
      }, 3000);
    }, 2000);
  };

  const generatePreview = () => {
    if (!selectedTemplate) return '';
    
    let preview = selectedTemplate.body;
    Object.keys(parameters).forEach((key) => {
      preview = preview.replace(`{${key}}`, parameters[key] || `{${key}}`);
    });
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Send WhatsApp Message</h1>
        <p className="text-sm text-gray-600 mt-1">Send messages to students individually or in bulk</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <h4 className="text-green-800 font-semibold">Messages sent successfully!</h4>
            <p className="text-green-700 text-sm">
              {selectedStudents.length} message{selectedStudents.length > 1 ? 's' : ''} queued for delivery
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Template & Parameters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Send Mode Toggle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Send Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSendMode('individual');
                  if (selectedStudents.length > 1) {
                    setSelectedStudents([selectedStudents[0]]);
                  }
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  sendMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User size={16} className="inline mr-2" />
                Individual
              </button>
              <button
                onClick={() => setSendMode('bulk')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  sendMode === 'bulk'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={16} className="inline mr-2" />
                Bulk
              </button>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Template</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setParameters({});
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-800">{template.category}</div>
                  <div className="text-xs text-gray-600 mt-1">{template.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters Input */}
          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Template Parameters</h3>
              <div className="space-y-3">
                {selectedTemplate.parameters.map((param) => (
                  <div key={param}>
                    <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                      {param.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={parameters[param] || ''}
                      onChange={(e) => setParameters({ ...parameters, [param]: e.target.value })}
                      placeholder={`Enter ${param}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Preview */}
          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Message Preview</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">SA</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{generatePreview()}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Student Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {sendMode === 'individual' ? 'Select Student' : 'Select Students'}
                </h3>
                <span className="text-xs text-gray-600">
                  {selectedStudents.length} selected
                </span>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Actions */}
              {sendMode === 'bulk' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={selectAllVisible}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All Visible
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* Student List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">No students found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.find((s) => s.id === student.id);
                    return (
                      <button
                        key={student.id}
                        onClick={() => {
                          if (sendMode === 'individual') {
                            setSelectedStudents([student]);
                          } else {
                            toggleStudentSelection(student);
                          }
                        }}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`text-sm font-bold ${
                                  isSelected ? 'text-white' : 'text-gray-600'
                                }`}
                              >
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800">{student.name}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-600">{student.phoneNumber}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">
                                  Class {student.className}-{student.section}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">Roll {student.rollNumber}</span>
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="text-blue-600" size={20} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selected Students Summary */}
          {selectedStudents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Selected Recipients</h3>
                <button
                  onClick={clearSelection}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-2"
                  >
                    <span className="text-xs text-blue-800 font-medium">{student.name}</span>
                    <button
                      onClick={() => toggleStudentSelection(student)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={!selectedTemplate || selectedStudents.length === 0 || isSending}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                !selectedTemplate || selectedStudents.length === 0 || isSending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message to {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;