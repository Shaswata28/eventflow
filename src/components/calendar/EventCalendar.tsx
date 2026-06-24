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

  const events = programs?.map((p: any) => ({
    id: p.id,
    title: `${p.client?.full_name || 'Unknown'} - ${p.program_name === 'custom' ? p.custom_name : p.program_name}`,
    start: p.event_date,
    allDay: true,
    backgroundColor: p.color || getStatusColor(p.status),
    borderColor: p.color || getStatusColor(p.status),
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
    <div className="bg-card rounded-xl shadow-sm border border-border h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden fc-theme-standard relative flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        /* Light Mode FullCalendar overrides */
        .fc {
          --fc-border-color: #EAEAEA;
          --fc-daygrid-event-dot-width: 8px;
          --fc-today-bg-color: #fcf9f8;
          --fc-event-bg-color: transparent;
          --fc-event-border-color: transparent;
          --fc-event-text-color: #1c1b1b;
          --fc-page-bg-color: #FAFAFA;
        }
        
        /* Dark Mode FullCalendar overrides */
        :is(.dark .fc) {
          --fc-border-color: #334155;
          --fc-today-bg-color: rgba(99,102,241,0.05);
          --fc-event-text-color: #f8fafc;
          --fc-page-bg-color: #1e293b;
          --fc-neutral-bg-color: #1e293b;
          --fc-list-event-hover-bg-color: #334155;
        }
        
        .fc-theme-standard .fc-scrollgrid { border: none; }
        .fc-theme-standard th { border: none; padding-bottom: 16px; border-bottom: 1px solid var(--fc-border-color); }
        .fc-theme-standard td { border: 1px solid var(--fc-border-color); }
        
        /* Cell background & hover */
        .fc .fc-daygrid-day {
          background-color: var(--fc-page-bg-color);
          transition: background-color 0.2s ease;
        }
        .fc .fc-daygrid-day:hover {
          background-color: #FFFFFF;
        }
        :is(.dark .fc .fc-daygrid-day:hover) {
          background-color: #334155;
        }
        
        /* Event Card Styling */
        .fc-event {
          margin-top: 4px;
          background-color: color-mix(in srgb, var(--event-color) 15%, transparent) !important;
          color: var(--event-color) !important;
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
          border-radius: 6px !important;
          border: none !important;
          border-left: 4px solid var(--event-color) !important;
          padding: 6px 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          overflow: visible !important;
        }
        .fc-event:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
          z-index: 50 !important;
        }
        .fc-event-main { color: inherit; overflow: visible; }
        .fc-event-title { font-weight: 600; font-size: 13px; line-height: 1.2; color: var(--event-color); filter: brightness(0.6); }
        :is(.dark .fc-event-title) { filter: brightness(1.3); }
        .fc-event-time { font-size: 11px; font-weight: 700; color: var(--event-color); margin-bottom: 2px; }

        /* Typography */
        .fc-col-header-cell-cushion { 
          font-size: 12px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          color: #8C8C8C; 
          font-weight: 500;
        }
        :is(.dark .fc-col-header-cell-cushion) { color: #64748b; }
        .fc-daygrid-day-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: #1c1b1b;
          padding: 12px;
        }
        :is(.dark .fc-daygrid-day-number) { color: #cbd5e1; }
        
        /* Today Highlight */
        .fc .fc-daygrid-day.fc-day-today {
          background-color: color-mix(in srgb, #6366f1 3%, transparent) !important;
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          background-color: #6366f1;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px;
          padding: 0;
          font-weight: bold;
        }
        
        /* Header Toolbar */
        .fc-header-toolbar {
          padding: 24px 24px 0 24px;
        }
        .fc-toolbar-title {
          font-weight: 700;
          font-size: 20px !important;
          color: #1c1b1b;
        }
        :is(.dark .fc-toolbar-title) { color: #f8fafc; }
        
        /* Segmented Control for Month/Week */
        .fc-toolbar-chunk:last-child .fc-button-group {
          background: #f1f5f9;
          padding: 4px;
          border-radius: 99px;
          display: flex;
          gap: 2px;
        }
        :is(.dark .fc-toolbar-chunk:last-child .fc-button-group) { background: #334155; }
        .fc .fc-button-primary { 
          background-color: transparent !important; 
          border: none !important; 
          color: #64748b !important;
          text-transform: capitalize;
          font-weight: 500;
          border-radius: 99px !important;
          padding: 6px 16px !important;
          transition: all 0.2s ease;
        }
        .fc .fc-button-primary:hover { 
          color: #0f172a !important;
        }
        :is(.dark .fc .fc-button-primary:hover) { color: #f8fafc !important; }
        .fc .fc-button-primary.fc-button-active {
          background-color: #ffffff !important;
          color: #0f172a !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
        }
        :is(.dark .fc .fc-button-primary.fc-button-active) {
          background-color: #1e293b !important;
          color: #f8fafc !important;
        }
        
        /* Prev / Next buttons */
        .fc .fc-prev-button, .fc .fc-next-button {
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          background-color: transparent !important;
          border: 1px solid #EAEAEA !important;
          color: #64748b !important;
        }
        :is(.dark .fc .fc-prev-button), :is(.dark .fc .fc-next-button) {
          border-color: #334155 !important;
          color: #94a3b8 !important;
        }
        .fc .fc-prev-button:hover, .fc .fc-next-button:hover {
          background-color: #f1f5f9 !important;
        }
        :is(.dark .fc .fc-prev-button:hover), :is(.dark .fc .fc-next-button:hover) {
          background-color: #334155 !important;
        }
        
        /* Today button */
        .fc .fc-today-button {
          border: 1px solid #EAEAEA !important;
          background-color: white !important;
          border-radius: 8px !important;
          padding: 6px 16px !important;
          margin-left: 12px !important;
          color: #64748b !important;
        }
        :is(.dark .fc .fc-today-button) {
          border-color: #334155 !important;
          background-color: #1e293b !important;
          color: #94a3b8 !important;
        }
        .fc .fc-today-button:hover {
          background-color: #f8fafc !important;
        }
        :is(.dark .fc .fc-today-button:hover) {
          background-color: #334155 !important;
        }
      `}} />

      <div className="flex-1 overflow-hidden p-6 pt-0">
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
          eventClassNames="cursor-pointer"
          dayMaxEvents={false}
          eventContent={(arg) => {
            return (
              <div style={{ '--event-color': arg.event.backgroundColor } as any} className="flex flex-col group relative w-full h-full">
                <div className="fc-event-time">{arg.timeText || 'All Day'}</div>
                <div className="fc-event-title line-clamp-2">{arg.event.title}</div>
                
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-gray-900 text-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999] shadow-xl pointer-events-none">
                   <p className="font-bold text-sm mb-1">{arg.event.title}</p>
                   <p className="text-gray-300 text-xs">{arg.timeText || 'All Day'}</p>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
