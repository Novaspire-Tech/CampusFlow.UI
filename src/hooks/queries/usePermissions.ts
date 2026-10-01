import { useState, useEffect } from 'react';

interface CrudPermission {
  operations: string[];
  scope: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<CrudPermission[]>([]);
  const role = localStorage.getItem('role');

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem('crudPermissions');
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  }, []);

  const canPerform = (scope: string, operation: string): boolean => {
    if (role === 'SCHOOL'||role === 'SCHOOL_GROUP') {
      return true;
    }

    return permissions.some(
      (perm) => perm.scope === scope && perm.operations.includes(operation)
    );
  };

  const getOperations = (scope: string): string[] => {
    if (role === 'SCHOOL') {
      return ['READ', 'CREATE', 'UPDATE', 'DELETE'];
    }

    const perm = permissions.find((p) => p.scope === scope);
    return perm?.operations || [];
  };

  return {
    canPerform,
    getOperations,
    canRead: (scope: string) => canPerform(scope, 'READ'),
    canCreate: (scope: string) => canPerform(scope, 'CREATE'),
    canUpdate: (scope: string) => canPerform(scope, 'UPDATE'),
    canDelete: (scope: string) => canPerform(scope, 'DELETE'),
  };
};