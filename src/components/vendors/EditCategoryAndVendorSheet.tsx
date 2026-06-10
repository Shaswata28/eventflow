import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateServiceCategory, useRemoveAssignment, useRemoveServiceCategory } from '@/lib/hooks/useAssignments'
import { Trash2 } from 'lucide-react'

export function EditCategoryAndVendorSheet({ 
  category, 
  isOpen, 
  onClose 
}: { 
  category: any, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateServiceCategory()
  const { mutateAsync: removeAssignment, isPending: isRemoving } = useRemoveAssignment()
  const { mutateAsync: removeCategory, isPending: isRemovingCategory } = useRemoveServiceCategory()
  
  const [budget, setBudget] = useState(category?.allocated_budget?.toString() || '')

  useEffect(() => {
    if (category) {
      setBudget(category.allocated_budget?.toString() || '')
    }
  }, [category])

  const assignment = category?.assignments?.[0]

  const handleUpdate = async () => {
    if (!budget) return
    try {
      await updateCategory({
        id: category.id,
        allocated_budget: Number(budget)
      })
      onClose()
    } catch (error) {
      console.error('Failed to update category budget:', error)
      alert('Failed to update category budget')
    }
  }

  const handleRemoveAssignment = async () => {
    if (!assignment) return
    if (!confirm('Are you sure you want to remove this vendor assignment? The quoted budget will be reset.')) return
    
    try {
      await removeAssignment(assignment.id)
      onClose()
    } catch (error) {
      console.error('Failed to remove assignment:', error)
      alert('Failed to remove assignment')
    }
  }

  const handleRemoveCategory = async () => {
    if (!confirm('Are you sure you want to completely remove this service category? This will also remove any vendor assignments and budgets allocated to it.')) return
    
    try {
      await removeCategory(category.id)
      onClose()
    } catch (error) {
      console.error('Failed to remove category:', error)
      alert('Failed to remove category. Please remove any vendor assignments first if it fails.')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="capitalize">Edit {category?.category} Category</SheetTitle>
          <SheetDescription>
            Update the allocated budget or manage the vendor assignment.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="budget">Allocated Budget (BDT)</Label>
            <Input 
              id="budget" 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="e.g. 50000"
            />
          </div>

          <Button onClick={handleUpdate} className="w-full" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Update Budget'}
          </Button>

          {assignment && (
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-4">Vendor Assignment</h4>
              
              <div className="bg-muted p-4 rounded-lg space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vendor:</span>
                  <span className="text-sm font-medium">{assignment.vendor?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quoted Price:</span>
                  <span className="text-sm font-medium">{assignment.quoted_price?.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium capitalize">{assignment.status.replace('_', ' ')}</span>
                </div>
                {assignment.vendor_payments && assignment.vendor_payments.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Payments Logged:</span>
                      <span className="text-sm font-medium">{assignment.vendor_payments.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Paid:</span>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        ৳{assignment.vendor_payments.reduce((sum: number, p: any) => 
                          p.payment_type === 'refund' ? sum - p.amount : sum + p.amount, 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Balance Due:</span>
                      <span className="text-sm font-medium">
                        ৳{(assignment.quoted_price - assignment.vendor_payments.reduce((sum: number, p: any) => 
                          p.payment_type === 'refund' ? sum - p.amount : sum + p.amount, 0
                        )).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleRemoveAssignment}
                disabled={isRemoving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isRemoving ? 'Removing...' : 'Remove Vendor Assignment'}
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-destructive mb-4">Danger Zone</h4>
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" 
              onClick={handleRemoveCategory}
              disabled={isRemovingCategory || isUpdating}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isRemovingCategory ? 'Deleting...' : 'Delete Service Category'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
