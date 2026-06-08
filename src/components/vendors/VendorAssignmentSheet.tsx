"use client"

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, DollarSign } from 'lucide-react'
import { useVendors } from '@/lib/hooks/useVendors'
import { useCreateVendorAssignment } from '@/lib/hooks/useAssignments'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type VendorCategory = Database['public']['Enums']['vendor_category']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceCategoryId: string
  category: VendorCategory
  programId: string
}

export function VendorAssignmentSheet({ open, onOpenChange, serviceCategoryId, category, programId }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [quotedPrice, setQuotedPrice] = useState<string>('')
  
  const { data: vendors, isLoading } = useVendors(category)
  const { mutateAsync: createAssignment, isPending } = useCreateVendorAssignment()

  const filteredVendors = vendors?.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAssign = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (!selectedVendorId || !quotedPrice) return
    // ... logic continues below


    const price = Number(quotedPrice)
    const { getRequiredApprovals } = await import('@/lib/utils/approvals')
    const requiredApprovals = getRequiredApprovals(price)
    
    // Determine initial approval level needed
    let approvalLevel: 'finance' | 'md' | null = requiredApprovals.length > 0 ? requiredApprovals[0] : null
    let status: Database['public']['Enums']['assignment_status'] = approvalLevel ? 'pending_approval' : 'approved'

    try {
      await createAssignment({
        assignment: {
          service_category_id: serviceCategoryId,
          vendor_id: selectedVendorId,
          quoted_price: price,
          status,
          requested_by: '00000000-0000-0000-0000-000000000000' // Placeholder user ID since we don't have auth context here for MVP
        },
        approval: approvalLevel ? {
          approval_level: approvalLevel,
          approver_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        } : undefined
      })
      
      toast.success(status === 'pending_approval' ? 'Approval request sent' : 'Vendor assigned successfully')
      onOpenChange(false)
      // Reset state
      setSelectedVendorId(null)
      setQuotedPrice('')
      setSearchTerm('')
    } catch (error: any) {
      toast.error('Failed to assign vendor: ' + error.message)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Find & Assign Vendor</SheetTitle>
          <SheetDescription className="capitalize">
            Searching for {category} vendors
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!selectedVendorId ? (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading vendors...</div>
              ) : filteredVendors?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  No vendors found in this category.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVendors?.map(vendor => (
                    <Card 
                      key={vendor.id} 
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedVendorId(vendor.id)}
                    >
                      <CardHeader className="p-4 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{vendor.name}</CardTitle>
                          {vendor.last_used_price && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last price: {vendor.last_used_price} BDT
                            </div>
                          )}
                        </div>
                        <Button variant="secondary" size="sm">Select</Button>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <div className="font-medium">{vendors?.find(v => v.id === selectedVendorId)?.name}</div>
                  <Badge variant="secondary" className="mt-1 capitalize">{category}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedVendorId(null)}>
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoted_price">Quoted Price (BDT) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="quoted_price"
                    type="number"
                    required
                    placeholder="Enter final quoted amount"
                    className="pl-8"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Amounts over {process.env.NEXT_PUBLIC_APPROVAL_THRESHOLD_FINANCE} require Finance approval.
                  Amounts over {process.env.NEXT_PUBLIC_APPROVAL_THRESHOLD_MD} require MD approval.
                </p>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button 
                  type="button"
                  onClick={handleAssign} 
                  disabled={isPending || !quotedPrice}
                >
                  {isPending ? 'Assigning...' : 'Assign Vendor'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
