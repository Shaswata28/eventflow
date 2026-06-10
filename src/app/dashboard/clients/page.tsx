import { ClientListTable } from '@/components/clients/ClientListTable'
import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Premium Hero Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner border border-indigo-200/50 dark:border-indigo-800/50">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Clients Directory
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Manage all clients, track their status, and assigned personnel.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ClientListTable />
    </div>
  )
}
