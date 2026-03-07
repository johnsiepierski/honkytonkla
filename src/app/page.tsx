'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar'

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-semibold">Honky Tonk LA</h1>

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
                googleCalendarId: '21ad802c5543ccf34c04d088677c75c1828498534b5a6c23966b22bae955dac9@group.calendar.google.com',
              },
            ]}
            height="auto"
          />
        </div>
      </div>
    </main>
  )
}