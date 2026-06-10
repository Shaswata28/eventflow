"use client"

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentUpload } from '@/components/shared/DocumentUpload'
import { useLogPayment } from '@/lib/hooks/useVendorPayments'
import { useProfile } from '@/lib/hooks/useProfile'
import { getPaymentSummary, getMaxPayable, getAllowedPaymentTypes, PAYMENT_TYPE_LABELS, getPaymentLabel } from '@/lib/utils/payments'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import { Loader2, AlertCircle, Banknote } from 'lucide-react'

type VendorPaymentRow = Database['public']['Tables']['vendor_payments']['Row']
type PaymentType = Database['public']['Enums']['payment_type']

interface LogPaymentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId: string
  quotedPrice: number
  payments: VendorPaymentRow[]
  eventDate: string
  presetPaymentType?: PaymentType
}

export function LogPaymentSheet({
  open,
  onOpenChange,
  assignmentId,
  quotedPrice,
  payments,
  eventDate,
  presetPaymentType,
}: LogPaymentSheetProps) {
  const { data: profile } = useProfile()
  const { mutateAsync: logPayment, isPending } = useLogPayment()

  const summary = getPaymentSummary(payments, quotedPrice)
  const maxPayable = getMaxPayable(quotedPrice, summary.totalPaid)
  const allowedTypes = getAllowedPaymentTypes(payments, eventDate)

  const [amount, setAmount] = useState<string>('')
  const [paymentType, setPaymentType] = useState<PaymentType>(presetPaymentType || allowedTypes[0] || 'advance')
  const [note, setNote] = useState<string>('')
  const [isUploadDone, setIsUploadDone] = useState(false)

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setAmount('')
      setPaymentType(presetPaymentType || allowedTypes[0] || 'advance')
      setNote('')
      setIsUploadDone(false)
    }
  }, [open, presetPaymentType])

  const numericAmount = Number(amount) || 0
  const isRefund = paymentType === 'refund'
  const isOverMax = !isRefund && numericAmount > maxPayable
  const isValid = numericAmount > 0 && !isOverMax && !!profile

  const handleSubmit = async () => {
    if (!isValid || !profile) return

    try {
      // Determine assignment status before payment
      const currentStatus = summary.hasAdvance ? 'confirmed' : 'approved'
      
      // Smart type override: if installment pays off the balance, make it a final payment
      let finalTypeToLog = paymentType
      if (paymentType === 'installment' && numericAmount === maxPayable && numericAmount > 0) {
        finalTypeToLog = 'final'
      }

      await logPayment({
        payment: {
          vendor_assignment_id: assignmentId,
          amount: numericAmount,
          payment_type: finalTypeToLog,
          paid_by: profile.id,
          note: note.trim() || null,
        },
        quotedPrice,
        currentTotalPaid: summary.totalPaid,
        currentStatus,
      })

      toast.success(`${PAYMENT_TYPE_LABELS[paymentType]} of ৳${numericAmount.toLocaleString()} logged successfully`)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to log payment:', error)
      toast.error('Failed to log payment. Please try again.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-indigo-500" />
            Log Payment
          </SheetTitle>
          <SheetDescription>
            Record a payment for this vendor assignment.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Quoted Price</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                ৳{quotedPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Already Paid</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                ৳{summary.totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Remaining</span>
              <span className={`text-lg font-bold tabular-nums ${
                summary.balanceDue <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                ৳{Math.max(0, summary.balanceDue).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Type Select */}
          <div className="space-y-2">
            <Label htmlFor="payment_type">Payment Type</Label>
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
              <SelectTrigger className="bg-white dark:bg-gray-900 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {PAYMENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (BDT)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={isRefund ? 'Refund amount' : `Max: ${maxPayable.toLocaleString()}`}
                className="pl-8 bg-white dark:bg-gray-900 rounded-xl placeholder:text-gray-400"
                min="0"
                max={isRefund ? undefined : maxPayable}
              />
            </div>
            {isOverMax && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>Exceeds remaining balance. Max: ৳{maxPayable.toLocaleString()}</span>
              </div>
            )}
            {!isOverMax && numericAmount === maxPayable && numericAmount > 0 && paymentType === 'advance' && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                <span>✨ This will be recorded as a Full Upfront Payment.</span>
              </div>
            )}
            {!isOverMax && numericAmount === maxPayable && numericAmount > 0 && paymentType === 'installment' && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                <span>✨ This pays off the balance and will be recorded as the Final Payment.</span>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid via bKash to vendor account"
              className="bg-white dark:bg-gray-900 rounded-xl resize-none placeholder:text-gray-400"
              rows={2}
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Upload Receipt (Optional)</Label>
            {isUploadDone ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-sm font-medium">
                ✓ Receipt uploaded successfully
              </div>
            ) : (
              <DocumentUpload
                parentId={assignmentId}
                parentType="vendor_assignment_id"
                bucket="bills"
                label="receipt"
                onSuccess={() => setIsUploadDone(true)}
              />
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isPending}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                `Log ${paymentType === 'installment' && numericAmount === maxPayable && numericAmount > 0 ? 'Final Payment' : getPaymentLabel(paymentType, numericAmount, quotedPrice)}`
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
