import { Metadata } from 'next'
import { VendorDetail } from '@/components/vendors/VendorDetail'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Vendor Details | MoonVeil Workspace',
  description: 'View vendor details and assignment history',
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard/vendors" 
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white">
              Vendor Profile
            </h3>
          </div>
        </div>
      </div>
      
      <VendorDetail id={id} />
    </div>
  )
}
