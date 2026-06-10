"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useVendors } from '@/lib/hooks/useVendors'
import { Database } from '@/types/database.types'
import { Phone, Star, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type VendorCategory = Database['public']['Enums']['vendor_category']

const CATEGORIES: VendorCategory[] = [
  'catering', 'decor', 'photography', 'venue', 'transport', 'other'
]

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'catering': return { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', text: 'text-orange-700 dark:text-orange-400', badgeBg: 'bg-orange-100 dark:bg-orange-500/20' }
    case 'decor': return { bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-700 dark:text-purple-400', badgeBg: 'bg-purple-100 dark:bg-purple-500/20' }
    case 'photography': return { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-500/20' }
    case 'venue': return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20' }
    case 'logistics': return { bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-200 dark:border-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-400', badgeBg: 'bg-cyan-100 dark:bg-cyan-500/20' }
    default: return { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300', badgeBg: 'bg-gray-100 dark:bg-gray-800' }
  }
}

export function VendorList() {
  const router = useRouter()
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'all'>('all')

  const { data: vendors, isLoading, error } = useVendors(categoryFilter)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button 
          onClick={() => setCategoryFilter('all')}
          className={`h-9 px-5 rounded-full text-sm font-semibold transition-all ${
            categoryFilter === 'all' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:scale-105' 
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`h-9 px-5 rounded-full text-sm font-semibold transition-all capitalize ${
              categoryFilter === cat 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:scale-105' 
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-[140px] w-full rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 dark:bg-red-500/10 p-6 rounded-3xl border border-red-200 dark:border-red-500/20 text-center font-medium">
          Failed to load vendors. Please try again.
        </div>
      ) : !vendors || vendors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">No vendors found matching your filters.</p>
          <button 
            className="h-9 px-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            onClick={() => setCategoryFilter('all')}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {vendors.map((vendor, index) => {
            const isActive = vendor.is_active
            const colors = getCategoryColor(vendor.category)
            
            return (
              <div 
                key={vendor.id} 
                className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 animate-in fade-in zoom-in-95 ${colors.bg} ${colors.border} ${!isActive ? 'opacity-60 grayscale' : ''}`}
                onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-base truncate pr-2 ${colors.text} ${!isActive ? 'line-through' : ''}`}>
                    {vendor.name}
                  </h3>
                  <span 
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-sm ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} 
                    title={isActive ? 'Active' : 'Inactive'}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors.badgeBg} ${colors.text}`}>
                    {vendor.category}
                  </span>
                  
                  {vendor.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{vendor.rating}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">New</span>
                  )}
                </div>
                
                <div className="mt-auto space-y-1.5 pt-3 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <Phone className="w-3.5 h-3.5 opacity-70" />
                    <span className="truncate">
                      {vendor.phone_primary || 'No phone'}
                    </span>
                  </div>
                  {(vendor.area || vendor.location) && (
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 opacity-70" />
                      <span className="truncate">
                        {vendor.area || vendor.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
