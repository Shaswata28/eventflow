export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CLIENT'

// Role hierarchy for checking permissions
const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 4,
  MANAGER: 3,
  AGENT: 2,
  CLIENT: 1,
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function isInternalTeam(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER', 'AGENT'].includes(role)
}
