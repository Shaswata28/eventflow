import { ClientListTable } from '@/components/clients/ClientListTable'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
          Clients
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
          Manage all clients, track their status, and assigned personnel.
        </p>
      </div>
      
      <ClientListTable />
    </div>
  )
}
