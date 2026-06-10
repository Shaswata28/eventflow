"use client"

import { useState } from 'react'
import { useVendor } from '@/lib/hooks/useVendors'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Phone, Star, DollarSign, StickyNote, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditVendorSheet } from './EditVendorSheet'

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'catering': return { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', text: 'text-orange-700 dark:text-orange-400', badgeBg: 'bg-orange-100 dark:bg-orange-500/20' }
    case 'decor': return { bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-700 dark:text-purple-400', badgeBg: 'bg-purple-100 dark:bg-purple-500/20' }
    case 'photography': return { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-500/20' }
    case 'venue': return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20' }
    case 'logistics': return { bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-400', badgeBg: 'bg-cyan-100 dark:bg-cyan-500/20' }
    default: return { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300', badgeBg: 'bg-gray-100 dark:bg-gray-800' }
  }
}

export function VendorDetail({ id }: { id: string }) {
  const { data: vendor, isLoading, error } = useVendor(id)
  const [isEditOpen, setIsEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="text-red-500 bg-red-50 dark:bg-red-500/10 p-6 rounded-3xl border border-red-200 dark:border-red-500/20 font-medium">
        Failed to load vendor details.
      </div>
    )
  }

  const colors = getCategoryColor(vendor.category)

  return (
    <>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className={`relative overflow-hidden ${colors.bg} border ${colors.border} rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            {/* Background flourish could go here */}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badgeBg} ${colors.text}`}>
                {vendor.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${vendor.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                {vendor.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-2 ${!vendor.is_active ? 'line-through opacity-75' : ''}`}>
              {vendor.name}
            </h1>
            
            {vendor.rating && (
              <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-lg">{vendor.rating}</span>
                <span className="text-gray-400 dark:text-gray-500">/ 5.0 rating</span>
              </div>
            )}
          </div>
          
          <div className="relative z-10 shrink-0">
            <Button 
              onClick={() => setIsEditOpen(true)}
              className={`rounded-xl font-semibold shadow-sm transition-all hover:scale-105 ${colors.bg.includes('gray') ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800'}`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
        
        {/* Detail Bento Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Information</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Primary Phone</p>
                <p className="text-gray-900 dark:text-white font-medium text-lg">{vendor.phone_primary || 'Not provided'}</p>
              </div>
              
              {vendor.phone_secondary && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Secondary Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium text-lg">{vendor.phone_secondary}</p>
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Location Details
                </p>
                <p className="text-gray-900 dark:text-white font-medium">{vendor.area || 'No area specified'}</p>
                {vendor.location && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{vendor.location}</p>}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <StickyNote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial & Notes</h3>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Last Known Price
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vendor.last_used_price ? `${vendor.last_used_price.toLocaleString()} BDT` : 'N/A'}
                </p>
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Internal Notes</p>
                {vendor.notes ? (
                  <p className="text-gray-700 dark:text-gray-300 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-500/10 p-4 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed">
                    {vendor.notes}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">No notes added for this vendor.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditVendorSheet 
        vendor={vendor} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </>
  )
}
