"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Star, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateVendor, useDeleteVendor } from '@/lib/hooks/useVendors'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import * as z from 'zod'

type VendorRow = Database['public']['Tables']['vendors']['Row']
type VendorCategory = Database['public']['Enums']['vendor_category']

const CATEGORIES: VendorCategory[] = [
  'decor', 'catering', 'photography', 'cinematography', 'sound', 'lighting', 'flowers', 'transport', 'printing', 'venue', 'other'
]

const formSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  category: z.string().min(1, 'Category is required'),
  phone_primary: z.string().min(1, 'Primary phone is required'),
  phone_secondary: z.string().optional(),
  location: z.string().optional(),
  area: z.string().optional(),
  last_used_price: z.coerce.number().optional().nullable(),
  rating: z.coerce.number().min(1).max(5).optional().nullable(),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

interface EditVendorSheetProps {
  vendor: VendorRow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVendorSheet({ vendor, open, onOpenChange }: EditVendorSheetProps) {
  const { mutateAsync: updateVendor, isPending } = useUpdateVendor()
  const { mutateAsync: deleteVendor, isPending: isDeleting } = useDeleteVendor()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<VendorRow>>({})
  const [lastUsedPrice, setLastUsedPrice] = useState<string>('')
  const [rating, setRating] = useState<string>('')

  // Sync state when sheet opens
  useEffect(() => {
    if (open && vendor) {
      setFormData({
        name: vendor.name,
        category: vendor.category,
        phone_primary: vendor.phone_primary,
        phone_secondary: vendor.phone_secondary || '',
        location: vendor.location || '',
        area: vendor.area || '',
        notes: vendor.notes || '',
        is_active: vendor.is_active,
      })
      setLastUsedPrice(vendor.last_used_price ? String(vendor.last_used_price) : '')
      setRating(vendor.rating ? String(vendor.rating) : '')
      setError(null)
    }
  }, [open, vendor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const payload: any = {
        ...formData,
        last_used_price: lastUsedPrice ? Number(lastUsedPrice) : null,
        rating: rating ? Number(rating) : null,
      }
      
      const validated = formSchema.parse(payload)
      
      await updateVendor({ id: vendor.id, updates: validated as any })
      toast.success('Vendor updated successfully')
      onOpenChange(false)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        setError(err.message || 'Failed to update vendor')
      }
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) {
      try {
        await deleteVendor(vendor.id)
        toast.success("Vendor deleted successfully")
        onOpenChange(false)
        router.push("/dashboard/vendors")
      } catch (err: any) {
        setError(err.message || "Failed to delete vendor")
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md md:max-w-xl custom-scrollbar">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Store className="w-5 h-5 text-indigo-500" />
            </div>
            Edit Vendor
          </SheetTitle>
          <SheetDescription>Update details and contact information for {vendor?.name}</SheetDescription>
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium mt-4 border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8 pb-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Vendor Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  value={formData.name || ''} 
                  onChange={handleChange} 
                  className="rounded-xl bg-white dark:bg-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger className="w-full rounded-xl bg-white dark:bg-gray-900">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select 
                  value={formData.is_active ? 'active' : 'inactive'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}
                >
                  <SelectTrigger className="w-full rounded-xl bg-white dark:bg-gray-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="space-y-2">
                <Label htmlFor="phone_primary">Primary Phone</Label>
                <Input 
                  id="phone_primary" 
                  name="phone_primary" 
                  required 
                  value={formData.phone_primary || ''} 
                  onChange={handleChange} 
                  className="rounded-xl bg-white dark:bg-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_secondary">Secondary Phone</Label>
                <Input 
                  id="phone_secondary" 
                  name="phone_secondary" 
                  value={formData.phone_secondary || ''} 
                  onChange={handleChange} 
                  className="rounded-xl bg-white dark:bg-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area / Zone</Label>
                <Input 
                  id="area" 
                  name="area" 
                  value={formData.area || ''} 
                  onChange={handleChange} 
                  className="rounded-xl bg-white dark:bg-gray-900"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Full Address</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location || ''} 
                  onChange={handleChange} 
                  className="rounded-xl bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Financial & Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last_used_price">Last Price (BDT)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold leading-none">৳</span>
                  <Input 
                    id="last_used_price" 
                    type="number"
                    value={lastUsedPrice} 
                    onChange={(e) => setLastUsedPrice(e.target.value)} 
                    className="rounded-xl bg-white dark:bg-gray-900 pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <div className="relative">
                  <Star className="absolute left-3 top-2.5 w-4 h-4 text-amber-500" />
                  <Input 
                    id="rating" 
                    type="number" 
                    min="1" max="5" step="0.1"
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                    className="rounded-xl bg-white dark:bg-gray-900 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleChange} 
                  rows={4}
                  className="rounded-xl resize-none bg-white dark:bg-gray-900"
                  placeholder="Any additional information..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isDeleting}
              className="rounded-xl font-semibold w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Vendor
            </Button>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending || isDeleting}
                className="rounded-xl font-semibold flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || isDeleting}
                className="rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex-1 sm:flex-none"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
