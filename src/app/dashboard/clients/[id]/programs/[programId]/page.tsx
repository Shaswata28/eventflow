'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Settings, FileText, CheckSquare, DollarSign, Info } from 'lucide-react'
import { useProgram } from '@/lib/hooks/usePrograms'
import { Badge } from '@/components/ui/badge'
import { BudgetAndVendorsTab } from '@/components/vendors/BudgetAndVendorsTab'
import { ChecklistBoard } from '@/components/checklist/ChecklistBoard'
import { toast } from 'sonner'

type Tab = 'overview' | 'budget' | 'checklist' | 'documents'

export default function ProgramDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const programId = params.programId as string
  const { data: program, isLoading, error } = useProgram(programId)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (isLoading) {
    return <div className="animate-pulse space-y-4 py-8 text-center text-gray-500">Loading program details...</div>
  }

  if (error || !program) {
    return <div className="text-red-500 p-4">Error loading program details.</div>
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Info },
    { id: 'budget', name: 'Budget & Vendors', icon: DollarSign },
    { id: 'checklist', name: 'Checklist', icon: CheckSquare },
    { id: 'documents', name: 'Documents', icon: FileText },
  ] as const

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'vendors_sourcing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'vendors_confirmed': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'live': return 'bg-red-100 text-red-800 animate-pulse dark:bg-red-900/30 dark:text-red-300'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const programName = program.program_name === 'custom' ? program.custom_name : program.program_name

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/dashboard/clients" className="hover:text-indigo-600 transition-colors">Clients</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li>
            <Link href={`/dashboard/clients/${clientId}`} className="hover:text-indigo-600 transition-colors">
              {program.client?.full_name || 'Client'}
            </Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li className="text-gray-900 dark:text-white font-medium capitalize">
            {programName}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-5 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/clients/${clientId}`}
            className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-3 capitalize">
              {programName}
              <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(program.status)}`}>
                {program.status.replace('_', ' ')}
              </Badge>
            </h3>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {new Date(program.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {program.venue_name && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {program.venue_name}
                </div>
              )}
              {program.guest_count && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {program.guest_count} Guests
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => toast('Edit program functionality is coming soon')}
             className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
           >
             <Settings className="w-4 h-4 mr-2" />
             Edit Program
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
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

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Program Overview</h3>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme / Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                    {program.theme_notes || 'No theme notes provided.'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Responsible Partner</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {program.responsible_partner ? 'Assigned (ID: ' + program.responsible_partner + ')' : 'Unassigned'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
        
        {activeTab === 'budget' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
            <BudgetAndVendorsTab programId={programId} />
          </div>
        )}
        
        {activeTab === 'checklist' && (
          <ChecklistBoard programId={programId} />
        )}
        
        {activeTab === 'documents' && (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 shadow rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Documents</h3>
            <p className="mt-1 text-sm text-gray-500">Coming in Phase 5: Documents & Approvals</p>
          </div>
        )}
      </div>
    </div>
  )
}
