'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, FileText, Settings, BookOpen } from 'lucide-react'
import { useClient } from '@/lib/hooks/useClients'
import { NotesTab } from '@/components/clients/NotesTab'
import { ProgramsTab } from '@/components/clients/ProgramsTab'

type Tab = 'overview' | 'notes' | 'programs' | 'documents'

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const { data: client, isLoading, error } = useClient(clientId)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (isLoading) {
    return <div className="animate-pulse space-y-4 py-8 text-center text-gray-500">Loading client details...</div>
  }

  if (error || !client) {
    return <div className="text-red-500 p-4">Error loading client details.</div>
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'notes', name: 'Consultation Notes', icon: BookOpen },
    { id: 'programs', name: 'Programs', icon: Calendar },
    { id: 'documents', name: 'Documents', icon: FileText },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients"
            className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-3">
              {client.full_name}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                ${client.status === 'lead' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${client.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                ${client.status === 'consultation' ? 'bg-blue-100 text-blue-800' : ''}
                ${client.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                ${client.status === 'archived' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {client.status}
              </span>
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Code: {client.client_code} • {client.event_type}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
             <Settings className="w-4 h-4 mr-2" />
             Edit Client
           </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                `}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} aria-hidden="true" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="py-4">
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Client Overview</h3>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{client.full_name}</dd>
                </div>
                {(client.bride_name || client.groom_name) && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Couple</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      {[client.bride_name, client.groom_name].filter(Boolean).join(' & ')}
                    </dd>
                  </div>
                )}
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{client.phone_primary}</dd>
                </div>
                {client.email && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{client.email}</dd>
                  </div>
                )}
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Range</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{client.budget_range || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && <NotesTab clientId={client.id} />}
        
        {activeTab === 'programs' && <ProgramsTab clientId={client.id} />}
        
        {activeTab === 'documents' && (
          <div className="text-center py-12 text-gray-500">Documents feature coming soon.</div>
        )}
      </div>
    </div>
  )
}
