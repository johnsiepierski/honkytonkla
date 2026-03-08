'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import type { EventClickArg, HeaderToolbarInput } from '@fullcalendar/core'
import { useRouter } from 'next/navigation'

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

  const headerToolbar: HeaderToolbarInput = mounted && isMobile
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
    <main className="min-h-screen bg-neutral-50 text-neutral-900 px-3 py-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Honky Tonk LA</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:mt-2">
            Two-stepping social dance events in the Los Angeles area
          </p>
        </header>

        <div className="rounded-2xl bg-white p-2 shadow sm:p-4">
          <div className="calendar-shell">
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
              height="auto"
              dayMaxEventRows={mounted && isMobile ? 2 : 3}
              fixedWeekCount={false}
            />
          </div>
        </div>
      </div>
    </main>
  )
}