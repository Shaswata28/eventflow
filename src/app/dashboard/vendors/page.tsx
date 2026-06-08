import { VendorList } from '@/components/vendors/VendorList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendors | EventFlow',
  description: 'Manage vendor database and assignments',
}

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-foreground">
          Vendors
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
          Search, filter, and manage vendors across all service categories.
        </p>
      </div>
      
      <VendorList />
    </div>
  )
}
