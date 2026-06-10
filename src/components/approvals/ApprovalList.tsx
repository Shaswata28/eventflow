"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Check, X, Clock, CalendarDays, User, ArrowRight } from 'lucide-react'
import { usePendingApprovals, useResolvedApprovals, EnrichedApprovalRequest } from '@/lib/hooks/useApprovals'
import { ResolveApprovalModal } from './ResolveApprovalModal'

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

  const renderApprovalCard = (approval: EnrichedApprovalRequest, isPending: boolean, index: number) => {
    const assignment = approval.vendor_assignments
    const vendor = assignment.vendors
    const service = assignment.service_categories
    const program = service.event_programs
    const client = program.clients
    const requestor = assignment.requested_by_user

    const isApproved = !isPending && approval.status === 'approved'
    const isRejected = !isPending && approval.status === 'rejected'

    return (
      <div 
        key={approval.id} 
        className={`flex flex-col bg-white dark:bg-gray-900 border ${isApproved ? 'border-emerald-200 dark:border-emerald-500/20 shadow-emerald-500/5' : isRejected ? 'border-red-200 dark:border-red-500/20 shadow-red-500/5' : 'border-gray-200/50 dark:border-gray-800'} rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group`}
        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      >
        <div className="p-6 pb-5 flex-1">
          <div className="flex justify-between items-start gap-4 mb-5">
            <div className="min-w-0 flex-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : isRejected ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'}`}>
                {service.category} Service
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {vendor.name}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-2xl font-black ${isApproved ? 'text-emerald-600 dark:text-emerald-400' : isRejected ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {assignment.quoted_price ? assignment.quoted_price.toLocaleString() : 0} ৳
              </p>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-4 h-4 mt-0.5 text-gray-400" />
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{client.full_name} • <span className="capitalize">{program.program_name}</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 mt-0.5 text-gray-400" />
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested By</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{requestor?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Requested on {format(new Date(approval.requested_at), 'MMM d, yyyy')}
          </div>

          {!isPending && approval.note && (
            <div className={`mt-4 p-4 rounded-2xl border text-sm ${isApproved ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-300'}`}>
              <span className="font-bold">Note: </span>
              <span>{approval.note}</span>
            </div>
          )}
        </div>
        
        <div className={`p-4 sm:px-6 flex gap-3 border-t mt-auto rounded-b-3xl ${
          isApproved ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' : 
          isRejected ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20' : 
          'bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800'
        }`}>
          {isPending ? (
            <div className="flex gap-3 w-full">
              <Button 
                className="flex-1 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-105" 
                onClick={() => handleOpenModal(approval, 'approved')}
              >
                <Check className="w-4 h-4 mr-1.5" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl font-semibold border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 transition-all"
                onClick={() => handleOpenModal(approval, 'rejected')}
              >
                <X className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full py-1">
              {isApproved ? (
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mr-2">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  Approved
                </div>
              ) : (
                <div className="flex items-center text-red-600 dark:text-red-400 font-bold text-sm">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mr-2">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  Rejected
                </div>
              )}
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {approval.resolved_at && format(new Date(approval.resolved_at), 'MMM d, h:mm a')}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700 inline-flex">
          <TabsTrigger 
            value="pending" 
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 data-[state=active]:dark:text-indigo-400 font-semibold transition-all"
          >
            Pending Approvals
            {pendingApprovals && pendingApprovals.length > 0 && (
              <Badge className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-none shadow-none text-xs px-2 py-0.5">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="resolved" 
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 data-[state=active]:dark:text-white font-semibold transition-all"
          >
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0 outline-none">
          {isLoadingPending ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
              Loading pending requests...
            </div>
          ) : pendingApprovals?.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/50 dark:border-gray-800 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">There are no pending vendor approvals waiting for you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingApprovals?.map((a, i) => renderApprovalCard(a, true, i))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-0 outline-none">
          {isLoadingResolved ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
              Loading resolved requests...
            </div>
          ) : resolvedApprovals?.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/50 dark:border-gray-800 shadow-sm animate-in zoom-in-95 duration-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No History</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't resolved any approvals yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {resolvedApprovals?.map((a, i) => renderApprovalCard(a, false, i))}
            </div>
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
