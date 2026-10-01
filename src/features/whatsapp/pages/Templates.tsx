import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  displayName: string;
  category: string;
  body: string;
  parameters: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  language: string;
}

const Templates: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data
  const templates: Template[] = [
    {
      id: '1',
      name: 'fee_reminder',
      displayName: 'Fee Reminder',
      category: 'Fee Management',
      body: 'Dear {{1}}, your fee payment of ₹{{2}} is due on {{3}}. Please pay at the earliest. Thank you.',
      parameters: ['studentName', 'amount', 'dueDate'],
      status: 'approved',
      createdAt: '2024-11-01',
      language: 'en',
    },
    {
      id: '2',
      name: 'exam_schedule',
      displayName: 'Exam Schedule',
      category: 'Examinations',
      body: 'Hello {{1}}, your {{2}} exam is scheduled on {{3}} at {{4}}. Please be present 15 minutes early.',
      parameters: ['studentName', 'examName', 'date', 'time'],
      status: 'approved',
      createdAt: '2024-11-02',
      language: 'en',
    },
    {
      id: '3',
      name: 'attendance_alert',
      displayName: 'Attendance Alert',
      category: 'Attendance',
      body: 'Dear Parent, {{1}} was absent on {{2}}. Current attendance: {{3}}%. Please ensure regular attendance.',
      parameters: ['studentName', 'date', 'percentage'],
      status: 'approved',
      createdAt: '2024-11-03',
      language: 'en',
    },
    {
      id: '4',
      name: 'event_notification',
      displayName: 'Event Notification',
      category: 'Events',
      body: 'Hello {{1}}, we are pleased to invite you to {{2}} on {{3}}. Looking forward to your participation.',
      parameters: ['studentName', 'eventName', 'date'],
      status: 'pending',
      createdAt: '2024-11-10',
      language: 'en',
    },
    {
      id: '5',
      name: 'result_announcement',
      displayName: 'Result Announcement',
      category: 'Examinations',
      body: 'Congratulations {{1}}! Your exam results are now available. Please check your portal.',
      parameters: ['studentName'],
      status: 'rejected',
      createdAt: '2024-11-05',
      language: 'en',
    },
  ];

  const categories = ['all', 'Fee Management', 'Examinations', 'Attendance', 'Events'];

  const filteredTemplates = templates.filter((template) =>
    categoryFilter === 'all' || template.category === categoryFilter
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      approved: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved', icon: <CheckCircle size={14} /> },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending', icon: <Clock size={14} /> },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected', icon: <XCircle size={14} /> },
    };

    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const CreateTemplateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [formData, setFormData] = useState({
      displayName: '',
      category: 'Fee Management',
      body: '',
      parameters: [''],
    });

    const handleAddParameter = () => {
      setFormData({ ...formData, parameters: [...formData.parameters, ''] });
    };

    const handleRemoveParameter = (index: number) => {
      const newParams = formData.parameters.filter((_, i) => i !== index);
      setFormData({ ...formData, parameters: newParams });
    };

    const handleParameterChange = (index: number, value: string) => {
      const newParams = [...formData.parameters];
      newParams[index] = value;
      setFormData({ ...formData, parameters: newParams });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Create New Template</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Templates must be approved by WhatsApp before use. Approval typically takes 1-2 business days.
              </p>
            </div>

            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Fee Reminder"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.filter(c => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Template Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Template <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Enter your message template. Use {{1}}, {{2}}, etc. for dynamic parameters."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {"{{1}}"}, {"{{2}}"}, {"{{3}}"} for dynamic values. Example: "Dear {"{{1}}"}, your fee of ₹{"{{2}}"} is due."
              </p>
            </div>

            {/* Parameters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameters
              </label>
              <div className="space-y-2">
                {formData.parameters.map((param, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium w-16">{"{{" + (index + 1) + "}}"}</span>
                    <input
                      type="text"
                      value={param}
                      onChange={(e) => handleParameterChange(index, e.target.value)}
                      placeholder="Parameter name (e.g., studentName)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.parameters.length > 1 && (
                      <button
                        onClick={() => handleRemoveParameter(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddParameter}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Parameter
              </button>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {formData.body || 'Your message preview will appear here...'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TemplateDetailModal: React.FC<{ template: Template; onClose: () => void }> = ({ template, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Template Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-600">Template Name</label>
              <p className="text-sm text-gray-800 font-medium mt-1">{template.displayName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Status</label>
              <div className="mt-1">{getStatusBadge(template.status)}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Category</label>
              <p className="text-sm text-gray-800 font-medium mt-1">{template.category}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Language</label>
              <p className="text-sm text-gray-800 font-medium mt-1">English</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Template Body</label>
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{template.body}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Parameters</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {template.parameters.map((param, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {"{{" + (index + 1) + "}}"} - {param}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Created On</label>
            <p className="text-sm text-gray-800 font-medium mt-1">
              {new Date(template.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
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
          <h1 className="text-2xl font-bold text-gray-800">Message Templates</h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage WhatsApp message templates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{templates.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {templates.filter(t => t.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {templates.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{template.displayName}</h3>
                  <p className="text-xs text-gray-600 mt-1">{template.category}</p>
                </div>
                {getStatusBadge(template.status)}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-700 line-clamp-3">{template.body}</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.parameters.slice(0, 3).map((param, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {param}
                  </span>
                ))}
                {template.parameters.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{template.parameters.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Plus className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 font-medium">No templates found</p>
          <p className="text-sm text-gray-500 mt-1">Create your first message template to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create Template
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateTemplateModal onClose={() => setShowCreateModal(false)} />}
      {selectedTemplate && (
        <TemplateDetailModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
      )}
    </div>
  );
};

export default Templates;