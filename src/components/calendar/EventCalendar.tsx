import { useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { usePrograms } from '@/lib/hooks/usePrograms'

export function EventCalendar() {
  const router = useRouter()
  const { data: programs, isLoading } = usePrograms()
  const calendarRef = useRef<FullCalendar>(null)

  if (isLoading) {
    return <div className="animate-pulse space-y-4 py-8 text-center text-gray-500">Loading calendar...</div>
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'planning': return '#eab308' // yellow-500
      case 'vendors_sourcing': return '#3b82f6' // blue-500
      case 'vendors_confirmed': return '#6366f1' // indigo-500
      case 'ready': return '#22c55e' // green-500
      case 'live': return '#ef4444' // red-500
      case 'completed': return '#6b7280' // gray-500
      case 'cancelled': return '#ef4444' // red-500
      default: return '#6b7280'
    }
  }

  const events = programs?.map((p: any) => ({
    id: p.id,
    title: `${p.client?.full_name || 'Unknown'} - ${p.program_name === 'custom' ? p.custom_name : p.program_name}`,
    start: p.event_date,
    allDay: true,
    backgroundColor: getStatusColor(p.status),
    borderColor: getStatusColor(p.status),
    extendedProps: {
      clientId: p.client_id,
      programId: p.id
    }
  })) || []

  const handleEventClick = (info: any) => {
    const { clientId, programId } = info.event.extendedProps
    if (clientId && programId) {
      router.push(`/dashboard/clients/${clientId}/programs/${programId}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden fc-theme-standard">
      <style dangerouslySetInnerHTML={{__html: `
        .fc-theme-standard .fc-scrollgrid { border-color: var(--color-gray-200); }
        .dark .fc-theme-standard .fc-scrollgrid { border-color: var(--color-gray-700); }
        .fc-theme-standard th { border-color: var(--color-gray-200); }
        .dark .fc-theme-standard th { border-color: var(--color-gray-700); }
        .fc-theme-standard td { border-color: var(--color-gray-200); }
        .dark .fc-theme-standard td { border-color: var(--color-gray-700); }
        .fc .fc-button-primary { background-color: var(--color-indigo-600); border-color: var(--color-indigo-600); }
        .fc .fc-button-primary:hover { background-color: var(--color-indigo-700); border-color: var(--color-indigo-700); }
        .fc .fc-button-primary:disabled { background-color: var(--color-indigo-400); border-color: var(--color-indigo-400); }
        .fc .fc-button-active { background-color: var(--color-indigo-800) !important; border-color: var(--color-indigo-800) !important; }
        .dark .fc .fc-col-header-cell-cushion { color: var(--color-gray-200); }
        .dark .fc .fc-daygrid-day-number { color: var(--color-gray-300); }
      `}} />
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={events}
        eventClick={handleEventClick}
        height="100%"
        editable={false}
        droppable={false}
        eventDisplay="block"
        eventClassNames="cursor-pointer font-medium capitalize truncate px-1 text-xs sm:text-sm"
        dayMaxEvents={true}
      />
    </div>
  )
}
