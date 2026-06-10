"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateVendor } from '@/lib/hooks/useVendors'
import { toast } from 'sonner'
import { Database } from '@/types/database.types'

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
})

type FormData = z.infer<typeof formSchema>

export function NewVendorForm() {
  const router = useRouter()
  const { mutateAsync: createVendor, isPending } = useCreateVendor()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<FormData>>({
    name: '',
    category: '',
    phone_primary: '',
    phone_secondary: '',
    location: '',
    area: '',
    notes: '',
  })
  
  const [lastUsedPrice, setLastUsedPrice] = useState<string>('')
  const [rating, setRating] = useState<string>('')

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
      
      const newVendor = await createVendor(validated as any)
      toast.success('Vendor added successfully')
      router.push(`/dashboard/vendors/${newVendor.id}`)
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message)
      } else {
        setError(err.message || 'Failed to create vendor')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100 dark:border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-semibold">Vendor Name *</Label>
          <Input 
            id="name" 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="E.g., Star Decorators" 
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-semibold">Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as string }))}
          >
            <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-indigo-500">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize rounded-lg">
                  {cat.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_primary" className="text-gray-700 dark:text-gray-300 font-semibold">Primary Phone *</Label>
          <Input 
            id="phone_primary" 
            name="phone_primary" 
            required 
            value={formData.phone_primary} 
            onChange={handleChange} 
            placeholder="+880 1..."
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_secondary" className="text-gray-700 dark:text-gray-300 font-semibold">Secondary Phone</Label>
          <Input 
            id="phone_secondary" 
            name="phone_secondary" 
            value={formData.phone_secondary} 
            onChange={handleChange} 
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area" className="text-gray-700 dark:text-gray-300 font-semibold">Area / Zone</Label>
          <Input 
            id="area" 
            name="area" 
            value={formData.area} 
            onChange={handleChange} 
            placeholder="E.g., Gulshan" 
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location" className="text-gray-700 dark:text-gray-300 font-semibold">Full Address</Label>
          <Input 
            id="location" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_used_price" className="text-gray-700 dark:text-gray-300 font-semibold">Last Used Price (BDT)</Label>
          <Input 
            id="last_used_price" 
            type="number"
            value={lastUsedPrice} 
            onChange={(e) => setLastUsedPrice(e.target.value)} 
            placeholder="0"
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating" className="text-gray-700 dark:text-gray-300 font-semibold">Rating (1-5)</Label>
          <Input 
            id="rating" 
            type="number" 
            min="1" 
            max="5"
            step="0.1"
            value={rating} 
            onChange={(e) => setRating(e.target.value)} 
            placeholder="5.0"
            className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300 font-semibold">Notes</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange} 
            placeholder="Any special terms, connection details, etc."
            rows={3}
            className="rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-105"
        >
          {isPending ? 'Saving...' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  )
}
