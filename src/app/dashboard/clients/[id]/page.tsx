'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, User, Calendar, FileText, Settings, BookOpen, Phone, Mail, DollarSign, Users } from 'lucide-react'
import { useClient } from '@/lib/hooks/useClients'
import { NotesTab } from '@/components/clients/NotesTab'
import { ProgramsTab } from '@/components/clients/ProgramsTab'
import { DocumentsTab } from '@/components/shared/DocumentsTab'
import { EditClientSheet } from '@/components/clients/EditClientSheet'
import { Skeleton } from '@/components/ui/skeleton'

type Tab = 'overview' | 'notes' | 'programs' | 'documents'

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const { data: client, isLoading, error } = useClient(clientId)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isEditOpen, setIsEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        {/* Skeleton for Header Profile Card */}
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0" />
          <div className="space-y-4 w-full sm:w-1/2 sm:mt-4">
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/2 rounded-lg" />
          </div>
        </div>
        
        {/* Skeleton for Tabs */}
        <div className="flex space-x-2 w-full max-w-lg">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>

        {/* Skeleton for Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-8">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-6 w-32 rounded" /></div>
              <div className="space-y-3"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-6 w-48 rounded" /></div>
            </div>
          </div>
          <div className="col-span-1 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-center space-y-8 bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700">
            <Skeleton className="h-6 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-24 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return <div className="text-red-500 p-4">Error loading client details.</div>
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'programs', name: 'Programs', icon: Calendar },
    { id: 'notes', name: 'Notes', icon: BookOpen },
    { id: 'documents', name: 'Documents', icon: FileText },
  ] as const

  // Generate a vibrant background for the avatar based on the client's name
  const getGradient = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500'
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  const initials = client.full_name.substring(0, 2).toUpperCase()

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-2 animate-in fade-in duration-300">
        <Link href="/dashboard/clients" className="text-muted-foreground hover:text-foreground transition-colors">Clients</Link>
        <ChevronRight className="text-muted-foreground w-4 h-4 mx-2" />
        <span className="text-foreground font-medium">{client.full_name}</span>
      </div>

      {/* Premium Header Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 shadow-sm animate-in fade-in zoom-in-95 duration-500">
        {/* Abstract Background Splash */}
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-r ${getGradient(client.full_name)} opacity-20 dark:opacity-10`} />
        
        <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full sm:w-auto">
            {/* Large Avatar */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl bg-gradient-to-br ${getGradient(client.full_name)}`}>
              {initials}
            </div>

            <div className="mt-4 sm:mt-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {client.full_name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${client.status === 'lead' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                  ${client.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                  ${client.status === 'consultation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''}
                  ${client.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : ''}
                  ${client.status === 'archived' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : ''}
                `}>
                  {client.status}
                </span>
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                {client.event_type.charAt(0).toUpperCase() + client.event_type.slice(1)} • Code: <span className="font-mono text-gray-700 dark:text-gray-300">{client.client_code}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsEditOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Pill-shaped Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
        <nav className="flex space-x-2 bg-gray-100/80 dark:bg-gray-800/50 p-1.5 rounded-2xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 w-full sm:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                  ${isActive 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'}
                `}
              >
                <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            {/* Contact Card */}
            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-800 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2">
                <User className="w-4 h-4" /> Contact Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"><Phone className="w-4 h-4 text-indigo-500" /></div>
                    Primary Phone
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white pl-12">{client.phone_primary}</p>
                </div>
                
                {client.email && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"><Mail className="w-4 h-4 text-indigo-500" /></div>
                      Email Address
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white pl-12 break-all">{client.email}</p>
                  </div>
                )}

                {(client.bride_name || client.groom_name) && (
                  <div className="space-y-2 sm:col-span-2 pt-6 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-lg"><Users className="w-4 h-4 text-pink-500" /></div>
                      The Couple
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white pl-12">
                      {[client.bride_name, client.groom_name].filter(Boolean).join(' & ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Card */}
            <div className="col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-center relative overflow-hidden group text-white transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 text-white/10 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <DollarSign className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-100 mb-8 flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm"><DollarSign className="w-4 h-4 text-white" /></div>
                  Estimated Budget
                </h3>
                <p className="text-3xl font-extrabold tracking-tight">
                  {client.budget_range || 'Not set'}
                </p>
                <p className="mt-4 text-sm font-medium text-indigo-100/80 bg-black/10 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                  Discussed during consultation
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && <NotesTab clientId={client.id} />}
        {activeTab === 'programs' && <ProgramsTab clientId={client.id} />}
        {activeTab === 'documents' && <DocumentsTab parentId={client.id} parentType="client_id" />}
      </div>
      
      {client && (
        <EditClientSheet 
          client={client}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  )
}
