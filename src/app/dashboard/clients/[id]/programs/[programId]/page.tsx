'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronRight, Calendar, MapPin, Users, Edit, Play, 
  Info, FileText, CheckCircle, Clock
} from 'lucide-react'
import { useProgram } from '@/lib/hooks/usePrograms'
import { BudgetAndVendorsTab } from '@/components/vendors/BudgetAndVendorsTab'
import { ChecklistBoard } from '@/components/checklist/ChecklistBoard'
import { DocumentsTab } from '@/components/shared/DocumentsTab'
import { EditProgramSheet } from '@/components/clients/EditProgramSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type Tab = 'overview' | 'budget' | 'checklist' | 'documents'

export default function ProgramDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const programId = params.programId as string
  const { data: program, isLoading, error } = useProgram(programId)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isEditOpen, setIsEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col pb-12 animate-in fade-in duration-500">
        <div className="flex items-center text-sm mb-6">
          <Skeleton className="h-4 w-16" />
          <ChevronRight className="text-gray-300 w-4 h-4 mx-2" />
          <Skeleton className="h-4 w-24" />
          <ChevronRight className="text-gray-300 w-4 h-4 mx-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {/* Skeleton Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-sm border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full md:w-auto space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-12 w-64 sm:w-96 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
        
        {/* Skeleton Tabs */}
        <div className="flex space-x-2 w-full max-w-lg mb-8">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>

        {/* Skeleton Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 p-6 sm:p-8 space-y-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="lg:col-span-2 rounded-3xl bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-700/30 p-6 sm:p-8 space-y-6">
            <Skeleton className="h-4 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return <div className="text-destructive p-4">Error loading program details.</div>
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Info },
    { id: 'checklist', name: 'Checklists', icon: CheckCircle },
    { id: 'budget', name: 'Budget & Vendors', icon: FileText },
    { id: 'documents', name: 'Documents', icon: FileText },
  ] as const

  const programName = program.program_name === 'custom' ? program.custom_name : program.program_name

  return (
    <div className="w-full flex-1 flex flex-col pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-6 animate-in fade-in duration-300">
        <Link href="/dashboard/clients" className="text-muted-foreground hover:text-foreground transition-colors">Clients</Link>
        <ChevronRight className="text-muted-foreground w-4 h-4 mx-2" />
        <Link href={`/dashboard/clients/${clientId}`} className="text-muted-foreground hover:text-foreground transition-colors">
          {program.client?.full_name || 'Client'}
        </Link>
        <ChevronRight className="text-muted-foreground w-4 h-4 mx-2" />
        <span className="text-foreground font-medium capitalize">{programName}</span>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm border border-gray-200/50 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-500">
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-30" 
          style={{ 
            background: `linear-gradient(135deg, ${program.color || '#6366f1'} 0%, transparent 100%)` 
          }}
        />
        
        <div className="relative p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 dark:bg-gray-800/80 shadow-sm backdrop-blur-md" style={{ color: program.color || '#6366f1' }}>
                {program.status.replace('_', ' ')}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white capitalize mb-4">
              {programName}
            </h1>
            
            {/* Frosted Glass Quick Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white/60 dark:bg-gray-800/60 p-2 rounded-2xl backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm">
                <Calendar className="w-5 h-5" style={{ color: program.color || '#6366f1' }} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(program.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">7:00 PM</span>
              </div>
              {program.guest_count && (
                <div className="flex items-center gap-2 px-4 py-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{program.guest_count} Guests</span>
                </div>
              )}
              {program.venue_name && (
                <div className="flex items-center gap-2 px-4 py-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{program.venue_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Edit className="w-4 h-4" /> Edit Details
            </button>
            <button
              onClick={() => toast('Execution mode coming soon')}
              className="px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: program.color || '#6366f1' }}
            >
              <Play className="w-4 h-4" fill="currentColor" /> Execute Event
            </button>
          </div>
        </div>
      </div>

      {/* Pill-shaped Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
        <nav className="flex space-x-2 bg-gray-100/80 dark:bg-gray-800/50 p-1.5 rounded-2xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 w-full md:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                  ${isActive 
                    ? 'bg-white dark:bg-gray-700 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'}
                `}
                style={{ color: isActive ? program.color || '#6366f1' : undefined }}
              >
                <Icon className={`mr-2 h-4 w-4 ${isActive ? '' : 'text-gray-400'}`} style={{ color: isActive ? program.color || '#6366f1' : undefined }} />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Summary Card */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                <Info className="w-4 h-4" /> Event Summary
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Event Manager</p>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {program.partner?.name ? program.partner.name : 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Client Contact</p>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">{program.client?.full_name || 'N/A'}</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    {program.client?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Notes Notepad */}
            <div className="lg:col-span-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-3xl p-6 sm:p-8 border border-yellow-200/50 dark:border-yellow-700/30 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-yellow-200 dark:bg-yellow-800/50" />
              <div className="absolute left-8 top-0 bottom-0 w-px bg-yellow-200 dark:bg-yellow-800/50" />
              
              <div className="relative z-10 pl-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-500 mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Internal Theme & Notes
                </h2>
                <div className="prose prose-yellow dark:prose-invert max-w-none">
                  <p className="text-lg text-yellow-900/80 dark:text-yellow-100/80 leading-relaxed whitespace-pre-wrap font-medium">
                    {program.theme_notes || 'No theme notes provided. Add notes about colors, vibe, or specific client requests here.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="bg-transparent">
            <BudgetAndVendorsTab programId={programId} />
          </div>
        )}

        {activeTab === 'checklist' && (
          <ChecklistBoard programId={programId} />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab parentId={programId} parentType="program_id" />
        )}
      </div>

      {program && (
        <EditProgramSheet 
          program={program}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  )
}
