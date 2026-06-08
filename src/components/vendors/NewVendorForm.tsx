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

  // Using simple state since react-hook-form with Shadcn might need more boilerplate
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
        // added_by could be added here if we had auth state, for MVP we can skip if it's optional
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Vendor Name *</Label>
          <Input 
            id="name" 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="E.g., Star Decorators" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as string }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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

        <div className="space-y-2">
          <Label htmlFor="phone_primary">Primary Phone *</Label>
          <Input 
            id="phone_primary" 
            name="phone_primary" 
            required 
            value={formData.phone_primary} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_secondary">Secondary Phone</Label>
          <Input 
            id="phone_secondary" 
            name="phone_secondary" 
            value={formData.phone_secondary} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Area / Zone</Label>
          <Input 
            id="area" 
            name="area" 
            value={formData.area} 
            onChange={handleChange} 
            placeholder="E.g., Gulshan" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Full Address</Label>
          <Input 
            id="location" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_used_price">Last Used Price (BDT)</Label>
          <Input 
            id="last_used_price" 
            type="number"
            value={lastUsedPrice} 
            onChange={(e) => setLastUsedPrice(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input 
            id="rating" 
            type="number" 
            min="1" 
            max="5"
            value={rating} 
            onChange={(e) => setRating(e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          placeholder="Any special terms, connection details, etc."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  )
}
