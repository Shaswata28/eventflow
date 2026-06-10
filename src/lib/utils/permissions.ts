import { Database } from '@/types/database.types'

// Generic access levels
export type AccessLevel = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CLIENT'

// Database user roles
export type DBUserRole = Database['public']['Enums']['user_role']

// Role hierarchy for checking permissions
const roleHierarchy: Record<AccessLevel, number> = {
  ADMIN: 4,
  MANAGER: 3,
  AGENT: 2,
  CLIENT: 1,
}

/**
 * Map a specific DB role to a generic access level
 */
export function getAccessLevel(role: DBUserRole): AccessLevel {
  switch (role) {
    case 'managing_director': return 'ADMIN'
    case 'finance_manager':
    case 'vendor_manager':
    case 'client_comms': return 'MANAGER'
    case 'operations':
    case 'decoration':
    case 'design': return 'AGENT'
    default: return 'CLIENT'
  }
}

/**
 * Check if the user has a specific minimum access level
 */
export function hasPermission(userRole: DBUserRole, requiredLevel: AccessLevel): boolean {
  return roleHierarchy[getAccessLevel(userRole)] >= roleHierarchy[requiredLevel]
}

export function isInternalTeam(role: DBUserRole): boolean {
  return getAccessLevel(role) !== 'CLIENT'
}
