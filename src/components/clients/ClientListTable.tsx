'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ChevronRight, User } from 'lucide-react'
import { useClients } from '@/lib/hooks/useClients'
import { formatDate } from '@/lib/utils/formatters'

export function ClientListTable() {
  const { data: clients, isLoading, error } = useClients()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const filteredClients = clients?.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.client_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return <div className="animate-pulse space-y-4 py-12 text-center text-gray-500 font-medium">Loading clients directory...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">Error loading clients: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm shadow-sm transition-all"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="block w-full sm:w-48 pl-4 pr-10 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="consultation">Consultation</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shrink-0"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Client
        </Link>
      </div>

      {/* Styled Card Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/60 dark:divide-gray-800">
            <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 sm:px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Client Details
                </th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Assigned Partner
                </th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 bg-transparent">
              {filteredClients?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">No clients found</p>
                      <p className="text-sm">Try adjusting your search or filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients?.map((client, index) => {
                  const initials = client.full_name.substring(0, 2).toUpperCase()
                  
                  return (
                    <tr 
                      key={client.id} 
                      onClick={() => window.location.href = `/dashboard/clients/${client.id}`}
                      className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                    >
                      <td className="px-6 sm:px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {client.full_name}
                            </div>
                            <div className="text-sm font-mono text-gray-500 mt-0.5">
                              {client.client_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                          {client.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full uppercase tracking-wider
                          ${client.status === 'lead' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                          ${client.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                          ${client.status === 'consultation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''}
                          ${client.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : ''}
                          ${client.status === 'archived' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : ''}
                        `}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                        {/* @ts-ignore */}
                        {client.assigned_user?.name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                              {/* @ts-ignore */}
                              {client.assigned_user.name.charAt(0)}
                            </div>
                            {/* @ts-ignore */}
                            {client.assigned_user.name}
                          </div>
                        ) : 'Unassigned'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end text-indigo-600 dark:text-indigo-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
