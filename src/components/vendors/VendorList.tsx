"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVendors } from '@/lib/hooks/useVendors'
import { Database } from '@/types/database.types'
import { Plus, Search, MapPin, Phone, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type VendorCategory = Database['public']['Enums']['vendor_category']

const CATEGORIES: VendorCategory[] = [
  'decor', 'catering', 'photography', 'cinematography', 'sound', 'lighting', 'flowers', 'transport', 'printing', 'venue', 'other'
]

export function VendorList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'all'>('all')

  const { data: vendors, isLoading, error } = useVendors(categoryFilter)

  const filteredVendors = vendors?.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-8 bg-surface"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
            <SelectTrigger className="w-[180px] bg-surface">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/vendors/new')}
          className="w-full sm:w-auto shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-[12px]" />
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive bg-destructive/10 p-4 rounded-[12px] border border-destructive/20">
          Failed to load vendors. Please try again.
        </div>
      ) : filteredVendors?.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-[12px] border border-border shadow-sm">
          <p className="text-muted-foreground mb-4">No vendors found matching your filters.</p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('')
            setCategoryFilter('all')
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVendors?.map((vendor) => (
            <Card 
              key={vendor.id} 
              className="cursor-pointer transition-all shadow-sm hover:shadow-md hover:border-primary/50 group bg-surface overflow-hidden flex flex-col rounded-[12px] border-border"
              onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
            >
              {/* Image Placeholder */}
              <div className="h-[120px] w-full bg-muted flex items-center justify-center text-muted-foreground">
                <span className="text-xs uppercase font-medium">{vendor.category} image</span>
              </div>
              <CardHeader className="p-3 pb-2 flex flex-col items-start space-y-1">
                <div className="flex w-full items-start justify-between">
                  <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 pr-2">
                    {vendor.name}
                  </CardTitle>
                  <Badge className="capitalize text-[10px] px-1.5 py-0 h-5 whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary">
                    {vendor.category}
                  </Badge>
                </div>
                {vendor.last_used_price && (
                  <Badge variant="outline" className="font-mono text-xs bg-[#f1f5f9] text-[#0f172a] border-none px-1.5 py-0.5">
                    ৳{vendor.last_used_price.toLocaleString()}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="px-3 pb-3 mt-auto space-y-1.5">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Star className={`h-3.5 w-3.5 mr-1.5 ${vendor.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  {vendor.rating ? (
                    <span className="font-medium text-foreground">{vendor.rating} / 5</span>
                  ) : (
                    <span className="italic">No rating</span>
                  )}
                </div>
                <div className="flex items-start text-xs text-muted-foreground line-clamp-1">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                  <span>{vendor.area || vendor.location || <span className="italic">Address not provided</span>}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
