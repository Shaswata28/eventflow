import { Metadata } from 'next'
import { NewVendorForm } from '@/components/vendors/NewVendorForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Add New Vendor | MoonVeil Workspace',
  description: 'Add a new vendor to the database',
}

export default function NewVendorPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard/vendors" 
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
            Add New Vendor
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the details to add a new vendor to your database.
          </p>
        </div>
      </div>
      
      <NewVendorForm />
    </div>
  )
}
