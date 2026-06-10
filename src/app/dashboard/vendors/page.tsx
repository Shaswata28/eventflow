import { VendorList } from '@/components/vendors/VendorList'
import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vendors | EventFlow',
  description: 'Manage vendor database and assignments',
}

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white">
            Vendors
          </h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
            Search, filter, and manage vendors across all service categories.
          </p>
        </div>
        <Link 
          href="/dashboard/vendors/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Vendor
        </Link>
      </div>
      
      <VendorList />
    </div>
  )
}
