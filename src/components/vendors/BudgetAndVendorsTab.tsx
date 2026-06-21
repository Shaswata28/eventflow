"use client"

import { useState } from 'react'
import { Plus, DollarSign, Edit, AlertCircle, TrendingUp, TrendingDown, Store, CheckCircle2, ChevronRight, ChevronDown, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useServiceCategories, useCreateServiceCategory } from '@/lib/hooks/useAssignments'
import { VendorAssignmentSheet } from './VendorAssignmentSheet'
import { EditCategoryAndVendorSheet } from './EditCategoryAndVendorSheet'
import { PaymentTimeline } from './PaymentTimeline'
import { LogPaymentSheet } from './LogPaymentSheet'
import { Database } from '@/types/database.types'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/lib/hooks/useProfile'
import { useProgram } from '@/lib/hooks/usePrograms'
import { getPaymentSummary, canLogPayment } from '@/lib/utils/payments'

type VendorCategory = Database['public']['Enums']['vendor_category']

const CATEGORIES: VendorCategory[] = [
  'decor', 'catering', 'photography', 'cinematography', 'sound', 'lighting', 'flowers', 'transport', 'printing', 'venue', 'other'
]

export function BudgetAndVendorsTab({ programId }: { programId: string }) {
  const { data: categories, isLoading } = useServiceCategories(programId)
  const { data: profile } = useProfile()
  const { data: program } = useProgram(programId)
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateServiceCategory()
  
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState<VendorCategory>('decor')
  const [newBudget, setNewBudget] = useState<string>('')
  
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedCategoryType, setSelectedCategoryType] = useState<VendorCategory | null>(null)

  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<any>(null)

  // Track which vendor rows are expanded to show payment timeline
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set())

  // Log payment sheet for the advance-payment-first flow
  const [advanceSheetOpen, setAdvanceSheetOpen] = useState(false)
  const [advanceSheetAssignment, setAdvanceSheetAssignment] = useState<any>(null)

  const userRole = profile?.role || 'operations'
  const eventDate = program?.event_date || new Date().toISOString()

  const toggleExpanded = (assignmentId: string) => {
    setExpandedAssignments(prev => {
      const next = new Set(prev)
      if (next.has(assignmentId)) {
        next.delete(assignmentId)
      } else {
        next.add(assignmentId)
      }
      return next
    })
  }

  const handleAddCategory = async () => {
    if (!newBudget) return
    
    await createCategory({
      program_id: programId,
      category: newCategory,
      allocated_budget: Number(newBudget),
      status: 'pending'
    })
    
    setIsAddingCategory(false)
    setNewBudget('')
  }

  const openAssignSheet = (id: string, cat: VendorCategory) => {
    setSelectedCategoryId(id)
    setSelectedCategoryType(cat)
    setSheetOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/50 dark:border-gray-800">
            <div className="flex justify-between items-end mb-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-6 w-32 ml-auto" />
              </div>
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-between mt-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="col-span-1 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-10 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm p-6 gap-6">
                <div className="lg:w-1/3 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalAllocated = categories?.reduce((sum, cat) => sum + cat.allocated_budget, 0) || 0
  const totalQuoted = categories?.reduce((sum, cat) => {
    const assignment = cat.assignments?.[0]
    return sum + (assignment ? assignment.quoted_price : 0)
  }, 0) || 0

  // Compute total paid across all vendor assignments
  const totalPaidAllVendors = categories?.reduce((sum, cat) => {
    const assignment = cat.assignments?.[0]
    if (!assignment || !assignment.vendor_payments) return sum
    const summary = getPaymentSummary(assignment.vendor_payments, assignment.quoted_price)
    return sum + summary.totalPaid
  }, 0) || 0

  const variance = totalAllocated - totalQuoted
  const isOverBudget = variance < 0
  const budgetPercentage = totalAllocated > 0 ? Math.min((totalQuoted / totalAllocated) * 100, 100) : 0
  const paidPercentage = totalQuoted > 0 ? Math.min((totalPaidAllVendors / totalQuoted) * 100, 100) : 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Dynamic Budget Tracker Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/50 dark:border-gray-800">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Quoted / Assigned</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {totalQuoted.toLocaleString()}
                </span>
                <span className="text-lg font-medium text-gray-500">BDT</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Allocated Budget</p>
              <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                {totalAllocated.toLocaleString()} BDT
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${
                isOverBudget ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm font-medium">
            <span className={isOverBudget ? 'text-red-500' : 'text-indigo-500'}>
              {budgetPercentage.toFixed(1)}% Used
            </span>
            <span className="text-gray-400">100%</span>
          </div>

          {/* Payment Progress (new) */}
          {totalQuoted > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" /> Total Paid to Vendors
                </p>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ৳{totalPaidAllVendors.toLocaleString()} / ৳{totalQuoted.toLocaleString()}
                </span>
              </div>
              <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full bg-emerald-500"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 tabular-nums">{paidPercentage.toFixed(1)}% Paid</p>
            </div>
          )}
        </div>
        
        {/* Glowing Variance Card */}
        <div className={`col-span-1 rounded-3xl p-6 sm:p-8 shadow-sm border flex flex-col justify-center relative overflow-hidden transition-colors duration-300
          ${isOverBudget 
            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' 
            : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
          }`}
        >
          <div className="relative z-10">
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2
              ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}
            `}>
              {isOverBudget ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              Budget Variance
            </h3>
            <p className={`text-3xl font-extrabold ${isOverBudget ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {Math.abs(variance).toLocaleString()} BDT
            </p>
            <p className={`mt-2 text-sm font-medium ${isOverBudget ? 'text-red-600/80 dark:text-red-400/80' : 'text-emerald-600/80 dark:text-emerald-400/80'}`}>
              {isOverBudget ? 'Over Budget!' : 'Remaining Surplus'}
            </p>
          </div>
        </div>
      </div>

      {/* Vendors List Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-500 delay-150 fill-mode-both">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-500" /> Service Categories & Vendors
          </h3>
          {!isAddingCategory && (
            <Button onClick={() => setIsAddingCategory(true)} className="rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4 mr-2" /> Allocate Budget
            </Button>
          )}
        </div>

        {isAddingCategory && (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Service Category</label>
                <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Allocated Budget (BDT)</label>
                <Input 
                  type="number" 
                  className="bg-white dark:bg-gray-900 rounded-xl placeholder:text-gray-500 dark:placeholder:text-gray-400" 
                  value={newBudget} 
                  onChange={(e) => setNewBudget(e.target.value)} 
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button variant="ghost" onClick={() => setIsAddingCategory(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAddCategory} disabled={isCreating || !newBudget} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">Save Allocation</Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {categories?.length === 0 && !isAddingCategory ? (
            <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/20 animate-in fade-in duration-500 delay-300 fill-mode-both">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-gray-400 leading-none">৳</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budgets allocated yet</h4>
              <p className="text-sm text-gray-500 mb-6">Start by allocating budget for different service categories.</p>
              <Button onClick={() => setIsAddingCategory(true)} className="rounded-xl shadow-sm">
                Allocate First Budget
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {categories?.map((cat, index) => {
                const assignment = cat.assignments?.[0]
                const isOver = assignment && assignment.quoted_price > cat.allocated_budget
                const payments = assignment?.vendor_payments || []
                const paymentSummary = assignment ? getPaymentSummary(payments, assignment.quoted_price) : null
                const isExpanded = assignment ? expandedAssignments.has(assignment.id) : false
                
                return (
                  <div 
                    key={cat.id} 
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50 + 200}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Category Summary (Left Side) */}
                      <div className="lg:w-1/3 bg-gray-50/50 dark:bg-gray-800/30 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 flex flex-col justify-center relative">
                        {/* Hidden Edit Button that appears on hover */}
                        <button 
                          onClick={() => {
                            setSelectedCategoryToEdit(cat)
                            setEditSheetOpen(true)
                          }}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-indigo-500">
                            <Store className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white capitalize">{cat.category}</h4>
                        </div>
                        <p className="text-sm font-medium text-gray-500 pl-13">
                          Allocated: <span className="text-gray-900 dark:text-white">{cat.allocated_budget.toLocaleString()}</span> BDT
                        </p>
                      </div>
                      
                      {/* Vendor Assignment Details (Right Side) */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                        {assignment ? (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Vendor Avatar Placeholder */}
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-lg shadow-sm flex-shrink-0">
                                {assignment.vendor?.name?.substring(0, 1).toUpperCase() || 'V'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                  {assignment.vendor?.name || 'Unknown Vendor'}
                                  {(assignment.status === 'confirmed' || assignment.status === 'fully_paid') && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className={`text-sm font-medium ${isOver ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                    Quoted: {assignment.quoted_price.toLocaleString()} BDT
                                  </span>
                                  <span className="text-gray-300 dark:text-gray-700">•</span>
                                  <Badge variant="outline" className={`text-xs capitalize border-0 font-medium ${
                                    assignment.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                    assignment.status === 'pending_approval' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                    assignment.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                    assignment.status === 'fully_paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                  }`}>
                                    {assignment.status === 'fully_paid' ? '✓ Fully Paid' : assignment.status.replace('_', ' ')}
                                  </Badge>

                                  {/* Inline payment summary */}
                                  {paymentSummary && paymentSummary.paymentCount > 0 && (
                                    <>
                                      <span className="text-gray-300 dark:text-gray-700">•</span>
                                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                                        Paid: ৳{paymentSummary.totalPaid.toLocaleString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800 flex-shrink-0">
                              {/* Log Advance Payment button for approved vendors without advance */}
                              {assignment.status === 'approved' && canLogPayment(userRole) && (
                                <Button 
                                  size="sm" 
                                  className="rounded-xl bg-amber-600 hover:bg-amber-700 shadow-sm text-white"
                                  onClick={() => {
                                    setAdvanceSheetAssignment(assignment)
                                    setAdvanceSheetOpen(true)
                                  }}
                                >
                                  <Banknote className="w-4 h-4 mr-1.5" />
                                  Log Advance
                                </Button>
                              )}

                              {/* Expand/collapse for payment timeline */}
                              {(payments.length > 0 || (assignment.status !== 'pending_approval' && assignment.status !== 'approved')) && (
                                <button 
                                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                                  onClick={() => toggleExpanded(assignment.id)}
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  <span className="ml-1 text-xs">{payments.length > 0 ? `${payments.length} payment${payments.length > 1 ? 's' : ''}` : 'Payments'}</span>
                                </button>
                              )}

                              <button 
                                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
                                onClick={() => {
                                  setSelectedCategoryToEdit(cat)
                                  setEditSheetOpen(true)
                                }}
                              >
                                Manage <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 h-full">
                            <div className="flex items-center gap-3 text-gray-400">
                              <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                                <span className="text-xl">?</span>
                              </div>
                              <span className="italic text-sm font-medium">No vendor assigned yet</span>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full sm:w-auto rounded-xl border-dashed border-2 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                              onClick={() => openAssignSheet(cat.id, cat.category)}
                            >
                              <Plus className="w-4 h-4 mr-2" /> Find Vendor
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Payment Timeline */}
                    {assignment && isExpanded && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <PaymentTimeline
                          payments={payments}
                          assignmentId={assignment.id}
                          assignmentStatus={assignment.status}
                          quotedPrice={assignment.quoted_price}
                          eventDate={eventDate}
                          userRole={userRole}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedCategoryId && selectedCategoryType && (
        <VendorAssignmentSheet 
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          serviceCategoryId={selectedCategoryId}
          category={selectedCategoryType}
          programId={programId}
        />
      )}

      {selectedCategoryToEdit && (
        <EditCategoryAndVendorSheet
          category={selectedCategoryToEdit}
          isOpen={editSheetOpen}
          onClose={() => setEditSheetOpen(false)}
        />
      )}

      {/* Advance Payment Sheet for approved vendors */}
      {advanceSheetAssignment && (
        <LogPaymentSheet
          open={advanceSheetOpen}
          onOpenChange={setAdvanceSheetOpen}
          assignmentId={advanceSheetAssignment.id}
          quotedPrice={advanceSheetAssignment.quoted_price}
          payments={advanceSheetAssignment.vendor_payments || []}
          eventDate={eventDate}
          presetPaymentType="advance"
        />
      )}
    </div>
  )
}
