'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import type { EventClickArg, ToolbarInput } from '@fullcalendar/core'
import { useRouter } from 'next/navigation'
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

const CALENDAR_ID =
  '21ad802c5543ccf34c04d088677c75c1828498534b5a6c23966b22bae955dac9@group.calendar.google.com'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)

    function handleResize() {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault()

    const eventId = info.event.id
    if (!eventId) return

    const href =
      `/event/${encodeURIComponent(eventId)}` +
      `?calendarId=${encodeURIComponent(CALENDAR_ID)}`

    router.push(href)
  }

  const headerToolbar: ToolbarInput =
    mounted && isMobile
      ? {
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }
      : {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }

        return (
          <main className="h-screen flex flex-col bg-white text-neutral-900">
            
            {/* Header */}
            <header className="flex-shrink-0 px-4 py-3 border-b border-neutral-200">
              <div className="max-w-7xl mx-auto">
              <h1 className={`${bebas.className} text-3xl sm:text-4xl text-center`}>
  Honky Tonk LA
</h1>
              </div>
            </header>
        
            {/* Calendar fills everything */}
            <div className="flex-1 min-h-0">
              <div className="h-full max-w-7xl mx-auto flex flex-col">
                
                {/* FullCalendar wrapper */}
                <div className="flex-1 min-h-0">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={headerToolbar}
                    googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
                    eventSources={[
                      {
                        googleCalendarId: CALENDAR_ID,
                      },
                    ]}
                    eventClick={handleEventClick}
                    height="100%"
                    expandRows={true}
                    dayMaxEventRows={mounted && isMobile ? 2 : 3}
                    fixedWeekCount={false}
                  />
                </div>
        
              </div>
            </div>
            <div className="h-4" />
          </main>
        )
}