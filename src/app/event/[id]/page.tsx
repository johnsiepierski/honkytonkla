import Link from 'next/link'
import { notFound } from 'next/navigation'

type EventPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ calendarId?: string }>
}

type GoogleCalendarEvent = {
  id?: string
  htmlLink?: string
  summary?: string
  description?: string
  location?: string
  start?: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
  end?: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
}

const FALLBACK_CALENDAR_ID =
  '21ad802c5543ccf34c04d088677c75c1828498534b5a6c23966b22bae955dac9@group.calendar.google.com'

function formatEventDateTime(
  value?: { date?: string; dateTime?: string; timeZone?: string },
) {
  if (!value) return 'TBD'

  if (value.dateTime) {
    const date = new Date(value.dateTime)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  if (value.date) {
    const date = new Date(`${value.date}T00:00:00`)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return 'TBD'
}

function buildMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location,
  )}`
}

export default async function EventPage({
  params,
  searchParams,
}: EventPageProps) {
  const { id } = await params
  const { calendarId } = await searchParams

  const resolvedCalendarId = calendarId || FALLBACK_CALENDAR_ID
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_GOOGLE_API_KEY')
  }

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/` +
    `${encodeURIComponent(resolvedCalendarId)}/events/` +
    `${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  if (response.status === 404) {
    notFound()
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch event: ${response.status} ${errorText}`)
  }

  const event = (await response.json()) as GoogleCalendarEvent

  const title = event.summary || 'Untitled event'
  const start = formatEventDateTime(event.start)
  const end = formatEventDateTime(event.end)
  const location = event.location?.trim()
  const description = event.description?.trim()
  const mapsUrl = location ? buildMapsUrl(location) : null

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back to calendar
        </Link>

        <article className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-semibold">{title}</h1>

          <div className="mt-6 space-y-4">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Starts
              </h2>
              <p className="mt-1 text-base">{start}</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Ends
              </h2>
              <p className="mt-1 text-base">{end}</p>
            </section>

            {location && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Location
                </h2>
                <p className="mt-1 text-base">{location}</p>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Open in Google Maps
                  </a>
                )}
              </section>
            )}

            {description && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Details
                </h2>
                <div className="mt-1 whitespace-pre-wrap text-base leading-7 text-neutral-800">
                  {description}
                </div>
              </section>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Open in Google Calendar
              </a>
            )}

            <Link
              href="/"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Back to calendar
            </Link>
          </div>
        </article>
      </div>
    </main>
  )
}