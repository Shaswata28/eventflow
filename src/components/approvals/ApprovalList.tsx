"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Check, X, Clock } from 'lucide-react'
import { usePendingApprovals, useResolvedApprovals, EnrichedApprovalRequest } from '@/lib/hooks/useApprovals'
import { ResolveApprovalModal } from './ResolveApprovalModal'
import { Database } from '@/types/database.types'

export function ApprovalList() {
  const { data: pendingApprovals, isLoading: isLoadingPending } = usePendingApprovals()
  const { data: resolvedApprovals, isLoading: isLoadingResolved } = useResolvedApprovals()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<EnrichedApprovalRequest | null>(null)
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null)

  const handleOpenModal = (approval: EnrichedApprovalRequest, decision: 'approved' | 'rejected') => {
    setSelectedApproval(approval)
    setDecision(decision)
    setModalOpen(true)
  }

  const renderApprovalCard = (approval: EnrichedApprovalRequest, isPending: boolean) => {
    const assignment = approval.vendor_assignments
    const vendor = assignment.vendors
    const service = assignment.service_categories
    const program = service.event_programs
    const client = program.clients
    const requestor = assignment.requested_by_user

    return (
      <Card key={approval.id} className="overflow-hidden">
        <CardContent className="p-0 sm:flex">
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{service.category} Service</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {assignment.quoted_price ? assignment.quoted_price.toLocaleString() : 0} BDT
                </p>
                <p className="text-sm text-gray-500">
                  Allocated: {service.allocated_budget.toLocaleString()} BDT
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Program</p>
                <p className="font-medium text-gray-900">{client.full_name} - <span className="capitalize">{program.program_name}</span></p>
              </div>
              <div>
                <p className="text-gray-500">Requested By</p>
                <p className="font-medium text-gray-900">{requestor?.name || 'Unknown'} <span className="text-xs text-gray-400">({format(new Date(approval.requested_at), 'MMM d, h:mm a')})</span></p>
              </div>
            </div>

            {!isPending && approval.note && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm">
                <span className="font-semibold text-gray-700">Approver Note: </span>
                <span className="text-gray-600">{approval.note}</span>
              </div>
            )}
          </div>
          
          <div className={`sm:w-48 p-6 flex sm:flex-col justify-center sm:justify-center items-center gap-3 border-t sm:border-t-0 sm:border-l ${
            !isPending && approval.status === 'approved' ? 'bg-green-50/50 border-green-100' : 
            !isPending && approval.status === 'rejected' ? 'bg-red-50/50 border-red-100' : 
            'bg-gray-50/50 border-gray-100'
          }`}>
            {isPending ? (
              <>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => handleOpenModal(approval, 'approved')}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleOpenModal(approval, 'rejected')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            ) : (
              <div className="text-center">
                {approval.status === 'approved' ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1">
                    <Check className="w-4 h-4 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100 px-3 py-1">
                    <X className="w-4 h-4 mr-1" />
                    Rejected
                  </Badge>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {approval.resolved_at && format(new Date(approval.resolved_at), 'MMM d, h:mm a')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending Approvals
            {pendingApprovals && pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoadingPending ? (
            <div className="text-center py-12 text-gray-500"><Clock className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading pending requests...</div>
          ) : pendingApprovals?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
              <Check className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-gray-500 mt-1">There are no pending vendor approvals waiting for you.</p>
            </div>
          ) : (
            pendingApprovals?.map(a => renderApprovalCard(a, true))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {isLoadingResolved ? (
            <div className="text-center py-12 text-gray-500">Loading resolved requests...</div>
          ) : resolvedApprovals?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">You haven't resolved any approvals yet.</p>
            </div>
          ) : (
            resolvedApprovals?.map(a => renderApprovalCard(a, false))
          )}
        </TabsContent>
      </Tabs>

      {selectedApproval && (
        <ResolveApprovalModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedApproval(null)
          }}
          approvalId={selectedApproval.id}
          assignmentId={selectedApproval.vendor_assignment_id}
          vendorName={selectedApproval.vendor_assignments.vendors.name}
          quotedPrice={selectedApproval.vendor_assignments.quoted_price}
          decision={decision}
          currentLevel={selectedApproval.approval_level}
        />
      )}
    </div>
  )
}
