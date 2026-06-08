"use client"

import { useState } from 'react'
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
import { DocumentUpload } from '@/components/shared/DocumentUpload'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

interface VendorConfirmationSheetProps {
  isOpen: boolean
  onClose: () => void
  assignmentId: string
  vendorName: string
  quotedPrice: number
}

export function VendorConfirmationSheet({
  isOpen,
  onClose,
  assignmentId,
  vendorName,
  quotedPrice
}: VendorConfirmationSheetProps) {
  const [advancePaid, setAdvancePaid] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadDone, setIsUploadDone] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await (supabase.from('vendor_assignments') as any)
        .update({
          advance_paid: advancePaid,
          status: 'confirmed'
        })
        .eq('id', assignmentId)

      if (error) throw error
      
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })
      onClose()
    } catch (error) {
      console.error('Failed to confirm vendor:', error)
      alert('Failed to confirm vendor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Confirm Vendor</SheetTitle>
          <SheetDescription>
            Record the advance payment and upload any bills for <strong>{vendorName}</strong>.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">Quoted Price</p>
            <p className="text-xl font-bold">{quotedPrice.toLocaleString()} BDT</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance_paid">Advance Paid (BDT)</Label>
            <Input
              id="advance_paid"
              type="number"
              value={advancePaid || ''}
              onChange={(e) => setAdvancePaid(Number(e.target.value))}
              placeholder="0"
              min="0"
              max={quotedPrice}
            />
            {advancePaid > quotedPrice && (
              <p className="text-sm text-red-500">Advance cannot exceed quoted price.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Upload Bill / Receipt (Optional)</Label>
            {isUploadDone ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                Documents uploaded successfully.
              </div>
            ) : (
              <DocumentUpload
                parentId={assignmentId}
                parentType="vendor_assignment_id"
                bucket="bills"
                label="bill"
                onSuccess={() => setIsUploadDone(true)}
              />
            )}
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isSubmitting || advancePaid > quotedPrice}
            >
              {isSubmitting ? 'Confirming...' : 'Finalize & Confirm'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
