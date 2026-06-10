import { Database } from '@/types/database.types'

type PaymentType = Database['public']['Enums']['payment_type']
type UserRole = Database['public']['Enums']['user_role']
type VendorPaymentRow = Database['public']['Tables']['vendor_payments']['Row']

export interface PaymentSummary {
  totalPaid: number
  balanceDue: number
  isFullyPaid: boolean
  hasAdvance: boolean
  hasFinal: boolean
  paymentCount: number
}

/**
 * Compute aggregate payment stats from a list of vendor payments.
 */
export function getPaymentSummary(payments: VendorPaymentRow[], quotedPrice: number): PaymentSummary {
  const totalPaid = payments.reduce((sum, p) =>
    p.payment_type === 'refund' ? sum - p.amount : sum + p.amount, 0
  )
  return {
    totalPaid,
    balanceDue: quotedPrice - totalPaid,
    isFullyPaid: totalPaid >= quotedPrice,
    hasAdvance: payments.some(p => p.payment_type === 'advance'),
    hasFinal: payments.some(p => p.payment_type === 'final'),
    paymentCount: payments.length,
  }
}

/**
 * A vendor can be marked confirmed only after at least one advance payment.
 */
export function canMarkConfirmed(payments: VendorPaymentRow[]): boolean {
  return payments.some(p => p.payment_type === 'advance')
}

/**
 * Final payment can only be logged after the event date and if no final exists yet.
 */
export function canLogFinalPayment(payments: VendorPaymentRow[], eventDate: string | Date): boolean {
  const today = new Date()
  const event = new Date(eventDate)
  const alreadyPaid = payments.some(p => p.payment_type === 'final')
  return today >= event && !alreadyPaid
}

import { hasPermission } from './permissions'

/**
 * Only managers and above can log payments.
 */
export function canLogPayment(userRole: UserRole): boolean {
  return hasPermission(userRole, 'MANAGER')
}

/**
 * Returns the maximum amount that can be paid without exceeding quoted price.
 */
export function getMaxPayable(quotedPrice: number, totalPaid: number): number {
  return Math.max(0, quotedPrice - totalPaid)
}

/**
 * Get allowed payment types based on current state.
 */
export function getAllowedPaymentTypes(
  payments: VendorPaymentRow[],
  eventDate: string | Date
): PaymentType[] {
  const types: PaymentType[] = []
  const hasAdvance = payments.some(p => p.payment_type === 'advance')
  const hasFinal = payments.some(p => p.payment_type === 'final')
  const today = new Date()
  const event = new Date(eventDate)

  if (!hasAdvance) {
    types.push('advance')
  }

  // Installments are always available once advance is logged
  if (hasAdvance) {
    types.push('installment')
  }

  // Final only after event date and if none exists
  if (today >= event && !hasFinal && hasAdvance) {
    types.push('final')
  }

  // Refund is always available if there are payments
  if (payments.length > 0) {
    types.push('refund')
  }

  return types
}

/**
 * Human-readable labels for payment types.
 */
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  advance: 'Advance',
  installment: 'Installment',
  final: 'Final Payment',
  refund: 'Refund',
}

/**
 * Dynamically get a payment label. Solves the visual issue of a 100% advance
 * looking weird by renaming it to 'Full Upfront Payment'.
 */
export function getPaymentLabel(paymentType: PaymentType, amount: number, quotedPrice: number): string {
  if (paymentType === 'advance' && amount >= quotedPrice && quotedPrice > 0) {
    return 'Full Upfront Payment'
  }
  return PAYMENT_TYPE_LABELS[paymentType]
}
