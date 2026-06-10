"use client"

import { usePrograms } from '@/lib/hooks/usePrograms'
import { MapPin, Clock, ChevronRight, Calendar } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export function UpcomingEvents({ hideViewCalendar = false, className }: { hideViewCalendar?: boolean, className?: string }) {
  const { data: programs, isLoading } = usePrograms()

  // Filter and sort active programs by date
  const upcomingPrograms = (programs || [])
    .filter(p => !['completed', 'cancelled'].includes(p.status))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5) // Show top 5 upcoming

  if (isLoading) {
    return (
      <section className={`bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col animate-in fade-in duration-500 ${className || 'h-[500px]'}`}>
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-5 space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="w-16 h-20 rounded-2xl shrink-0" />
              <div className="space-y-3 flex-1 pt-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'planning': return '#FFB300' // vibrant amber
      case 'vendors_sourcing': return '#00BFFF' // deep sky blue
      case 'vendors_confirmed': return '#8A2BE2' // blue violet
      case 'ready': return '#00E676' // vibrant green
      case 'live': return '#FF1493' // deep pink
      case 'completed': return '#78909C' // blue grey
      case 'cancelled': return '#D50000' // vibrant red
      default: return '#78909C'
    }
  }

  return (
    <section className={`bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col overflow-hidden group ${className || 'h-[500px]'}`}>
      <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Events
        </h3>
        {!hideViewCalendar && (
          <Link href="/dashboard/calendar" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center">
            View Calendar <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {upcomingPrograms.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">No upcoming events</p>
            <p className="text-sm mt-1">Your schedule is clear.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcomingPrograms.map((program, index) => {
              const eventDate = new Date(program.event_date)
              const name = program.program_name === 'custom' ? program.custom_name : program.program_name
              
              let dateText = format(eventDate, 'MMM')
              let dateNum = format(eventDate, 'd')

              if (isToday(eventDate)) {
                dateText = "Today"
              } else if (isTomorrow(eventDate)) {
                dateText = "Tmw"
              }
              
              const eventColor = program.color || getStatusColor(program.status)

              return (
                <li 
                  key={program.id} 
                  className="group/item hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <Link href={`/dashboard/clients/${program.client_id}/programs/${program.id}`} className="p-3 sm:p-4 flex items-start gap-4">
                    <div 
                      className="flex flex-col items-center justify-center rounded-2xl w-16 h-20 flex-shrink-0 border transition-transform duration-300 group-hover/item:scale-105 shadow-sm"
                      style={{ 
                        backgroundColor: `color-mix(in srgb, ${eventColor} 10%, transparent)`, 
                        borderColor: `color-mix(in srgb, ${eventColor} 30%, transparent)` 
                      }}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: eventColor }}>{dateText}</span>
                      <span className="text-2xl font-mono font-extrabold leading-none" style={{ color: eventColor }}>{dateNum}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex flex-col items-start gap-1 mb-1">
                        <div className="flex gap-2">
                          {program.status === 'live' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 border border-pink-200 dark:border-pink-500/30 animate-pulse">
                              Live
                            </span>
                          )}
                          {program.status === 'planning' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                              Planning
                            </span>
                          )}
                          {program.status === 'vendors_sourcing' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
                              Sourcing
                            </span>
                          )}
                          {program.status === 'vendors_confirmed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                              Confirmed
                            </span>
                          )}
                          {program.status === 'ready' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                              Ready
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 capitalize group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                          {name}: {program.client?.full_name || 'Client'}
                        </h4>
                      </div>
                      
                      {program.venue_name && (
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{program.venue_name}</span>
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3 text-indigo-500" /> 
                          {/* Event time is hardcoded in mock since we don't have it in DB, fallback to generic or placeholder */}
                          {format(eventDate, 'h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 self-center">
                      <ChevronRight className="text-indigo-500 w-5 h-5" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
