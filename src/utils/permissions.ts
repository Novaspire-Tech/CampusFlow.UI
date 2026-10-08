interface ScopePermission {
  scope: string
  operations: string[]
}

const readPermissions = (key: string): ScopePermission[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!Array.isArray(value)) return []

    return value.filter(
      (permission): permission is ScopePermission =>
        permission !== null &&
        typeof permission === 'object' &&
        typeof permission.scope === 'string' &&
        Array.isArray(permission.operations) &&
        permission.operations.every((operation: unknown) => typeof operation === 'string'),
    )
  } catch (error) {
    console.error(`Failed to read ${key}`, error)
    return []
  }
}

export const hasScopePermission = (
  scope?: string,
  operation = 'READ',
): boolean => {
  if (!scope) return true

  const packagePermissions = readPermissions('packageScopes')
  const packageAllows = packagePermissions.some(
    (permission) =>
      permission.scope === scope && permission.operations.includes(operation),
  )
  if (!packageAllows) return false

  const role = localStorage.getItem('role')
  if (role === 'SCHOOL' || role === 'SCHOOL_GROUP') return true

  const rolePermissions = readPermissions('crudPermissions')
  return rolePermissions.some(
    (permission) =>
      permission.scope === scope && permission.operations.includes(operation),
  )
}
