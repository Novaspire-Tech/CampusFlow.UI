// AdminCardComponent.tsx - Enhanced version with Permissions
import React from 'react';
import IconField from '../IconField';
import { useTranslation } from 'react-i18next';
import { getPagesDataText } from '../../helpers/useTranslations';


interface AdminCardComponentProps {
  id: string;
  name: string;
  number: string;
  email?: string;
  role?: string;
  department?: string;
  designation?: string;
  imageUrl?: string | null;
  OnEdit: () => void;
  OnView: () => void;
  OnDelete: () => void;
  canEdit?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}

const AdminCardComponent: React.FC<AdminCardComponentProps> = ({
  id,
  name,
  number,
  email,
  role,
  department,
  imageUrl,
  OnEdit,
  OnView,
  OnDelete,
  canEdit = true,
  canView = true,
  canDelete = true,
}) => {
  const { t } = useTranslation()
      const T = getPagesDataText(t)
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Card Header */}
      <div className="bg-blue-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-blue-700">{id}</span>
          <div className="flex space-x-2">
            {canView && (
              <button
                onClick={OnView}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                title="View"
              >
                <IconField name="FaEye" size={16} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={OnEdit}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                title="Edit"
              >
                <IconField name="FaEdit" size={16} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={OnDelete}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                title="Delete"
              >
                <IconField name="FaTrash" size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Profile Image and Name */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <IconField name="FaUserCircle" size={32} className="text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{name}</h3>
            {/* <p className="text-sm text-gray-600">{designation || 'Staff'}</p> */}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <IconField name="FaBriefcase" className="text-gray-500 mr-2" size={14} />
            <span className="font-medium text-gray-700">{T.Role}:</span>
            <span className="ml-2 text-gray-600">{role || 'N/A'}</span>
          </div>

          <div className="flex items-center text-sm">
            <IconField name="FaBuilding" className="text-gray-500 mr-2" size={14} />
            <span className="font-medium text-gray-700">{T.Department}:</span>
            <span className="ml-2 text-gray-600">{department || 'N/A'}</span>
          </div>

          <div className="flex items-center text-sm">
            <IconField name="FaPhone" className="text-gray-500 mr-2" size={14} />
            <span className="font-medium text-gray-700">{T.Mobile_Number}:</span>
            <span className="ml-2 text-gray-600">{number || 'N/A'}</span>
          </div>

          {email && (
            <div className="flex items-center text-sm">
              <IconField name="FaEnvelope" className="text-gray-500 mr-2" size={14} />
              <span className="font-medium text-gray-700">{T.Email}</span>
              <span className="ml-2 text-gray-600 truncate">{email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCardComponent;