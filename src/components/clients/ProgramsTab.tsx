import { useState } from 'react'
import { usePrograms } from '@/lib/hooks/usePrograms'
import { Plus, Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { NewProgramSheet } from './NewProgramSheet'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function ProgramsTab({ clientId }: { clientId: string }) {
  const { data: programs, isLoading } = usePrograms(clientId)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-1/2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800 shadow-sm p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" /> Event Programs
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all events for this client</p>
        </div>
        <button
          onClick={() => setIsSheetOpen(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Program
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {programs?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-indigo-300" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No programs yet</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started by creating the first event program.</p>
            <button
              onClick={() => setIsSheetOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
            >
              Add Program <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          programs?.map((program: any, index: number) => (
            <Link 
              href={`/dashboard/clients/${clientId}/programs/${program.id}`}
              key={program.id} 
              className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 block group overflow-hidden animate-in fade-in zoom-in-95"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              {/* Top Color Accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 opacity-80 group-hover:opacity-100 transition-opacity" 
                style={{ backgroundColor: program.color || '#6366f1' }}
              />
              
              <div className="p-3 sm:p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="outline" className={`mb-2 capitalize border-0 font-medium text-[10px] py-0 px-2 ${getStatusColor(program.status)}`}>
                      {program.status.replace('_', ' ')}
                    </Badge>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white capitalize line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {program.program_name === 'custom' ? program.custom_name : program.program_name}
                    </h4>
                  </div>
                  
                  {/* Floating Date Icon */}
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
                    <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">
                      {new Date(program.event_date).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-base font-extrabold text-gray-900 dark:text-white leading-none">
                      {new Date(program.event_date).getDate()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 flex-1">
                  {program.venue_name && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                      <div className="p-1 bg-white dark:bg-gray-700 rounded shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <span className="font-medium truncate">{program.venue_name}</span>
                    </div>
                  )}
                  {program.guest_count && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                      <div className="p-1 bg-white dark:bg-gray-700 rounded shadow-sm">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <span className="font-medium">{program.guest_count} Guests</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <NewProgramSheet 
        clientId={clientId} 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
      />
    </div>
  )
}
