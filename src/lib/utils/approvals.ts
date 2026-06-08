import { Database } from '@/types/database.types'

type ApprovalLevel = Database['public']['Enums']['approval_level']
type AssignmentStatus = Database['public']['Enums']['assignment_status']

const THRESHOLD_FINANCE = Number(process.env.NEXT_PUBLIC_APPROVAL_THRESHOLD_FINANCE) || 50000
const THRESHOLD_MD = Number(process.env.NEXT_PUBLIC_APPROVAL_THRESHOLD_MD) || 100000

export function getRequiredApprovals(amount: number): ApprovalLevel[] {
  if (amount <= THRESHOLD_FINANCE) return [] // auto-approved
  if (amount <= THRESHOLD_MD) return ['finance'] // finance only
  return ['finance', 'md'] // both required sequentially
}

export function determineNextStatus(
  currentLevel: ApprovalLevel, 
  decision: 'approved' | 'rejected', 
  amount: number
): { 
  assignmentStatus: AssignmentStatus, 
  escalateTo?: ApprovalLevel 
} {
  if (decision === 'rejected') {
    return { assignmentStatus: 'rejected' }
  }

  // If approved by finance, check if MD approval is also needed
  if (currentLevel === 'finance' && amount > THRESHOLD_MD) {
    return { assignmentStatus: 'pending_approval', escalateTo: 'md' }
  }

  // If approved by MD, or approved by finance when amount <= MD threshold
  return { assignmentStatus: 'approved' }
}
