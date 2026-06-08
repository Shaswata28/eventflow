"use client"

import { useVendor } from '@/lib/hooks/useVendors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Phone, Star, DollarSign, StickyNote } from 'lucide-react'

export function VendorDetail({ id }: { id: string }) {
  const { data: vendor, isLoading, error } = useVendor(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">
        Failed to load vendor details.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-50/50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{vendor.name}</CardTitle>
              <div className="mt-2 flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {vendor.category}
                </Badge>
                {vendor.rating && (
                  <div className="flex items-center text-sm font-medium text-amber-500">
                    <Star className="w-4 h-4 mr-1 fill-amber-500" />
                    {vendor.rating} / 5
                  </div>
                )}
                <Badge variant={vendor.is_active ? 'default' : 'destructive'} className={vendor.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : ''}>
                  {vendor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-gray-900 font-medium">{vendor.phone_primary}</div>
                    {vendor.phone_secondary && (
                      <div className="text-gray-500 text-sm mt-1">{vendor.phone_secondary}</div>
                    )}
                  </div>
                </div>
                
                {(vendor.location || vendor.area) && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      {vendor.area && <div className="text-gray-900 font-medium">{vendor.area}</div>}
                      {vendor.location && <div className="text-gray-500 text-sm mt-1">{vendor.location}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Financial & Notes</h4>
              <div className="space-y-3">
                {vendor.last_used_price !== null && (
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-gray-500 text-sm">Last Known Price</div>
                      <div className="text-gray-900 font-medium">{vendor.last_used_price.toLocaleString()} BDT</div>
                    </div>
                  </div>
                )}
                
                {vendor.notes && (
                  <div className="flex items-start">
                    <StickyNote className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-gray-500 text-sm">Notes</div>
                      <div className="text-gray-900 text-sm mt-1 whitespace-pre-wrap">{vendor.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Vendor History would go here in future phases */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Assignment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-6">
            History of programs this vendor was assigned to will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
