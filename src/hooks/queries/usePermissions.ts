import { hasScopePermission } from '../../utils/permissions'

const OPERATIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE'] as const

export const usePermissions = () => {
  const canPerform = (scope: string, operation: string): boolean =>
    hasScopePermission(scope, operation)

  const getOperations = (scope: string): string[] =>
    OPERATIONS.filter((operation) => canPerform(scope, operation))

  return {
    canPerform,
    getOperations,
    canRead: (scope: string) => canPerform(scope, 'READ'),
    canCreate: (scope: string) => canPerform(scope, 'CREATE'),
    canUpdate: (scope: string) => canPerform(scope, 'UPDATE'),
    canDelete: (scope: string) => canPerform(scope, 'DELETE'),
  }
}
