"use client"

import { useState } from 'react'
import { Plus, DollarSign, Edit, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useServiceCategories, useCreateServiceCategory } from '@/lib/hooks/useAssignments'
import { VendorAssignmentSheet } from './VendorAssignmentSheet'
import { VendorConfirmationSheet } from './VendorConfirmationSheet'
import { Database } from '@/types/database.types'

type VendorCategory = Database['public']['Enums']['vendor_category']

const CATEGORIES: VendorCategory[] = [
  'decor', 'catering', 'photography', 'cinematography', 'sound', 'lighting', 'flowers', 'transport', 'printing', 'venue', 'other'
]

export function BudgetAndVendorsTab({ programId }: { programId: string }) {
  const { data: categories, isLoading } = useServiceCategories(programId)
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateServiceCategory()
  
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState<VendorCategory>('decor')
  const [newBudget, setNewBudget] = useState<string>('')
  
  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedCategoryType, setSelectedCategoryType] = useState<VendorCategory | null>(null)

  // Confirmation Sheet state
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)

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
    return <div className="animate-pulse space-y-4 py-8">Loading budget details...</div>
  }

  const totalAllocated = categories?.reduce((sum, cat) => sum + cat.allocated_budget, 0) || 0
  const totalQuoted = categories?.reduce((sum, cat) => {
    const assignment = cat.assignments?.[0]
    return sum + (assignment ? assignment.quoted_price : 0)
  }, 0) || 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Total Allocated Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalAllocated.toLocaleString()} BDT</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">Total Quoted / Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalQuoted.toLocaleString()} BDT</div>
          </CardContent>
        </Card>
        
        <Card className={`bg-white/80 backdrop-blur-sm ${totalQuoted > totalAllocated ? 'border-red-200' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium flex items-center justify-between">
              Variance
              {totalQuoted > totalAllocated && <AlertCircle className="h-4 w-4 text-red-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalQuoted > totalAllocated ? 'text-red-600' : 'text-green-600'}`}>
              {(totalAllocated - totalQuoted).toLocaleString()} BDT
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Categories</h3>
          {!isAddingCategory && (
            <Button onClick={() => setIsAddingCategory(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Allocate Budget
            </Button>
          )}
        </div>

        {isAddingCategory && (
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Service Category</label>
                <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                  <SelectTrigger className="bg-white">
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
                <label className="text-sm font-medium">Allocated Budget (BDT)</label>
                <Input 
                  type="number" 
                  className="bg-white" 
                  value={newBudget} 
                  onChange={(e) => setNewBudget(e.target.value)} 
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                <Button onClick={handleAddCategory} disabled={isCreating || !newBudget}>Save</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {categories?.length === 0 && !isAddingCategory ? (
            <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50/50">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No budgets allocated yet</p>
              <Button variant="link" onClick={() => setIsAddingCategory(true)}>Start allocating budget</Button>
            </div>
          ) : (
            categories?.map(cat => {
              const assignment = cat.assignments?.[0]
              
              return (
                <Card key={cat.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                    <div className="w-full sm:w-1/4 flex-shrink-0">
                      <div className="font-semibold capitalize text-lg">{cat.category}</div>
                      <div className="text-sm text-gray-500">Budget: {cat.allocated_budget.toLocaleString()} BDT</div>
                    </div>
                    
                    <div className="flex-1 w-full bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                      {assignment ? (
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium text-gray-900">{assignment.vendor?.name || 'Unknown Vendor'}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <span>Quoted: {assignment.quoted_price.toLocaleString()} BDT</span>
                              <Badge variant="outline" className={`text-xs ${
                                assignment.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                assignment.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                assignment.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-50'
                              }`}>
                                {assignment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {assignment.status === 'approved' && (
                              <Button 
                                size="sm" 
                                className="h-8 bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  setSelectedAssignment(assignment)
                                  setConfirmSheetOpen(true)
                                }}
                              >
                                Confirm Vendor
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-gray-500 h-8 px-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-500 italic text-sm">No vendor assigned</span>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => openAssignSheet(cat.id, cat.category)}
                          >
                            Find Vendor
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
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

      {selectedAssignment && (
        <VendorConfirmationSheet
          isOpen={confirmSheetOpen}
          onClose={() => setConfirmSheetOpen(false)}
          assignmentId={selectedAssignment.id}
          vendorName={selectedAssignment.vendor?.name || 'Vendor'}
          quotedPrice={selectedAssignment.quoted_price}
        />
      )}
    </div>
  )
}
