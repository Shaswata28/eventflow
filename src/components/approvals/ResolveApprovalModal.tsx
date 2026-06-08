"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useResolveApproval } from '@/lib/hooks/useApprovals'
import { Database } from '@/types/database.types'

interface ResolveApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  approvalId: string
  assignmentId: string
  vendorName: string
  quotedPrice: number
  decision: 'approved' | 'rejected' | null
  currentLevel: Database['public']['Enums']['approval_level']
}

export function ResolveApprovalModal({
  isOpen,
  onClose,
  approvalId,
  assignmentId,
  vendorName,
  quotedPrice,
  decision,
  currentLevel
}: ResolveApprovalModalProps) {
  const [note, setNote] = useState('')
  const { mutateAsync: resolveApproval, isPending } = useResolveApproval()

  const handleConfirm = async () => {
    if (!decision) return
    
    try {
      await resolveApproval({
        approvalId,
        assignmentId,
        decision,
        note,
        currentLevel,
        quotedPrice
      })
      onClose()
      setNote('')
    } catch (error) {
      console.error('Failed to resolve approval:', error)
    }
  }

  const isReject = decision === 'rejected'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? 'Reject' : 'Approve'} Vendor Assignment
          </DialogTitle>
          <DialogDescription>
            You are about to {isReject ? 'reject' : 'approve'} the assignment for <strong>{vendorName}</strong> at {quotedPrice.toLocaleString()} BDT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">
              Note {isReject && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="note"
              placeholder={isReject ? "Please provide a reason for rejection..." : "Add an optional note..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            variant={isReject ? "destructive" : "default"} 
            onClick={handleConfirm}
            disabled={isPending || (isReject && note.trim().length === 0)}
          >
            {isPending ? "Saving..." : isReject ? "Reject Assignment" : "Approve Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
