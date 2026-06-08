import { useState } from 'react'
import { usePrograms } from '@/lib/hooks/usePrograms'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'
import { NewProgramSheet } from './NewProgramSheet'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export function ProgramsTab({ clientId }: { clientId: string }) {
  const { data: programs, isLoading } = usePrograms(clientId)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (isLoading) {
    return <div className="animate-pulse space-y-4 py-4 text-center text-gray-500">Loading programs...</div>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Programs</h3>
        <button
          onClick={() => setIsSheetOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Program
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No programs scheduled yet.</p>
          </div>
        ) : (
          programs?.map((program: any) => (
            <Link 
              href={`/dashboard/clients/${clientId}/programs/${program.id}`}
              key={program.id} 
              className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow block group"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {program.program_name === 'custom' ? program.custom_name : program.program_name}
                </h4>
                <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(program.status)}`}>
                  {program.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{new Date(program.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {program.venue_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>{program.venue_name}</span>
                  </div>
                )}
                {program.guest_count && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>{program.guest_count} Guests</span>
                  </div>
                )}
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
