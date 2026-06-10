"use client"

import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ArrowDownCircle,
  Banknote,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/database.types'
import { getPaymentSummary, canLogPayment, getPaymentLabel } from '@/lib/utils/payments'
import { LogPaymentSheet } from './LogPaymentSheet'
import { formatDate } from '@/lib/utils/formatters'

type VendorPaymentRow = Database['public']['Tables']['vendor_payments']['Row'] & {
  paid_by_user?: { name: string } | null
}
type UserRole = Database['public']['Enums']['user_role']
type PaymentType = Database['public']['Enums']['payment_type']

const PAYMENT_TYPE_ICONS: Record<PaymentType, React.ReactNode> = {
  advance: <Banknote className="w-4 h-4" />,
  installment: <ArrowDownCircle className="w-4 h-4" />,
  final: <CheckCircle2 className="w-4 h-4" />,
  refund: <RefreshCw className="w-4 h-4" />,
}

const PAYMENT_TYPE_COLORS: Record<PaymentType, string> = {
  advance: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  installment: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  final: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  refund: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
}

interface PaymentTimelineProps {
  payments: VendorPaymentRow[]
  assignmentId: string
  assignmentStatus: string
  quotedPrice: number
  eventDate: string
  userRole: UserRole
}

export function PaymentTimeline({
  payments,
  assignmentId,
  assignmentStatus,
  quotedPrice,
  eventDate,
  userRole,
}: PaymentTimelineProps) {
  const [logSheetOpen, setLogSheetOpen] = useState(false)
  const [presetPaymentType, setPresetPaymentType] = useState<PaymentType | undefined>(undefined)

  const summary = getPaymentSummary(payments, quotedPrice)
  const canLog = canLogPayment(userRole)
  const paidPercentage = quotedPrice > 0 ? Math.min((summary.totalPaid / quotedPrice) * 100, 100) : 0

  const handleLogPayment = (type?: PaymentType) => {
    setPresetPaymentType(type)
    setLogSheetOpen(true)
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Advance Required Warning */}
      {assignmentStatus === 'approved' && !summary.hasAdvance && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex-1">
            Log advance payment to confirm this vendor
          </p>
          {canLog && (
            <Button
              size="sm"
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              onClick={() => handleLogPayment('advance')}
            >
              Log Advance Payment
            </Button>
          )}
        </div>
      )}

      {/* Payment Entries */}
      {payments.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
            Payment History
          </p>
          {payments.map((payment, index) => (
            <div
              key={payment.id}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl group hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              {/* Status Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                payment.payment_type === 'refund'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              }`}>
                {payment.payment_type === 'refund' ? <RefreshCw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>

              {/* Type Badge */}
              <Badge variant="outline" className={`text-xs capitalize border-0 font-medium ${PAYMENT_TYPE_COLORS[payment.payment_type]}`}>
                {PAYMENT_TYPE_ICONS[payment.payment_type]}
                <span className="ml-1">{getPaymentLabel(payment.payment_type, payment.amount, quotedPrice)}</span>
              </Badge>

              {/* Amount */}
              <span className={`font-bold text-sm tabular-nums ${
                payment.payment_type === 'refund' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
              }`}>
                {payment.payment_type === 'refund' ? '-' : ''}৳{payment.amount.toLocaleString()}
              </span>

              {/* Date */}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(payment.paid_at)}
              </span>

              {/* Paid By */}
              {payment.paid_by_user?.name && (
                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                  {payment.paid_by_user.name}
                </span>
              )}

              {/* Note tooltip */}
              {payment.note && (
                <span className="text-xs text-gray-400 italic hidden lg:inline truncate max-w-32" title={payment.note}>
                  "{payment.note}"
                </span>
              )}

              <div className="flex-1" />

              {/* Receipt link */}
              {payment.bill_url && (
                <a
                  href={payment.bill_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  title="View receipt"
                >
                  <Receipt className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-6">
          {/* Paid Amount */}
          <div>
            <p className="text-xs text-gray-400 font-medium">Paid</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              ৳{summary.totalPaid.toLocaleString()}
            </p>
          </div>

          {/* Balance Due */}
          <div>
            <p className="text-xs text-gray-400 font-medium">Balance</p>
            <p className={`text-sm font-bold tabular-nums ${
              summary.isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
            }`}>
              {summary.isFullyPaid ? '✓ Fully Paid' : `৳${summary.balanceDue.toLocaleString()}`}
            </p>
          </div>

          {/* Progress Bar (inline) */}
          <div className="hidden sm:flex items-center gap-2 flex-1 min-w-24">
            <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-32">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  summary.isFullyPaid ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 tabular-nums">{paidPercentage.toFixed(0)}%</span>
          </div>
        </div>

        {/* Log Payment Button */}
        {canLog && !summary.isFullyPaid && assignmentStatus !== 'approved' && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
            onClick={() => handleLogPayment()}
          >
            <Plus className="w-4 h-4 mr-1" /> Log Payment
          </Button>
        )}

        {summary.isFullyPaid && (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Fully Paid
          </Badge>
        )}
      </div>

      {/* Log Payment Sheet */}
      <LogPaymentSheet
        open={logSheetOpen}
        onOpenChange={setLogSheetOpen}
        assignmentId={assignmentId}
        quotedPrice={quotedPrice}
        payments={payments}
        eventDate={eventDate}
        presetPaymentType={presetPaymentType}
      />
    </div>
  )
}
