'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import type { EventClickArg } from '@fullcalendar/core'
import { useRouter } from 'next/navigation'

const CALENDAR_ID =
  '21ad802c5543ccf34c04d088677c75c1828498534b5a6c23966b22bae955dac9@group.calendar.google.com'

export default function Home() {
  const router = useRouter()

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault()

    const eventId = info.event.id
    if (!eventId) return

    const href =
      `/event/${encodeURIComponent(eventId)}` +
      `?calendarId=${encodeURIComponent(CALENDAR_ID)}`

    router.push(href)
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Honky Tonk LA</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Two-stepping social dance events in the Los Angeles area
          </p>
        </header>

        <div className="rounded-2xl bg-white p-4 shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
            eventSources={[
              {
                googleCalendarId: CALENDAR_ID,
              },
            ]}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
      </div>
    </main>
  )
}