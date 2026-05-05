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
  }
}

const FALLBACK_CALENDAR_ID =
  '21ad802c5543ccf34c04d088677c75c1828498534b5a6c23966b22bae955dac9@group.calendar.google.com'

const LA_TIMEZONE = 'America/Los_Angeles'

function sanitizeDescriptionHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\sstyle=(?:"[^"]*"|'[^']*')/gi, '')
    .replace(
      /\s(href|src)=(["'])(.*?)\2/gi,
      (_match, attr: string, quote: string, url: string) => {
        const safeUrl = url.trim()

        if (
          safeUrl.startsWith('http://') ||
          safeUrl.startsWith('https://') ||
          safeUrl.startsWith('mailto:')
        ) {
          return ` ${attr}=${quote}${safeUrl}${quote}`
        }

        return ''
      },
    )
}

function formatEventStart(value?: { date?: string; dateTime?: string }) {
  if (!value) return 'TBD'

  if (value.dateTime) {
    const date = new Date(value.dateTime)

    const weekday = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: LA_TIMEZONE,
    }).format(date)

    const monthDay = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      timeZone: LA_TIMEZONE,
    }).format(date)

    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: LA_TIMEZONE,
    }).format(date)

    return `${weekday}, ${monthDay} • ${time}`
  }

  if (value.date) {
    const date = new Date(`${value.date}T00:00:00`)

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: LA_TIMEZONE,
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
  const start = formatEventStart(event.start)
  const location = event.location?.trim()
  const description = event.description?.trim()
  const descriptionHtml = description ? sanitizeDescriptionHtml(description) : ''
  const mapsUrl = location ? buildMapsUrl(location) : null

  return (
    <main className="min-h-screen bg-[#f8f4ea] px-4 py-8 text-[#2f2418] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-block text-sm font-medium text-[#7a5230] hover:text-[#5f3d21]"
        >
          ← Back to calendar
        </Link>

        <article className="mt-6 border border-[#d8c8ae] bg-[#fffaf0]">
          <div className="border-b border-[#d8c8ae] px-5 py-5 sm:px-8 sm:py-7">
            <h1 className="text-3xl font-semibold tracking-tight text-[#2f2418] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-lg text-[#5f3d21]">{start}</p>
          </div>

          <div className="px-5 py-6 sm:px-8">
            {location && (
              <section className="border-b border-[#d8c8ae] pb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#7a6a55]">
                  Location
                </h2>
                <p className="mt-2 text-base text-[#2f2418]">{location}</p>

                <a
                  href={mapsUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-[#b84f3a] hover:text-[#8f3d2d]"
                >
                  Open in Google Maps
                </a>
              </section>
            )}

            {description && (
              <section className={location ? 'pt-6' : ''}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#7a6a55]">
                  Details
                </h2>
                <div
                  className="mt-2 whitespace-pre-wrap text-base leading-7 text-[#2f2418] [&_a]:font-medium [&_a]:text-[#b84f3a] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#8f3d2d]"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </section>
            )}

            {!description && (
              <section className={location ? 'pt-6' : ''}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#7a6a55]">
                  Details
                </h2>
                <div className="mt-2 text-base leading-7 text-[#7a6a55]">
                  No description provided.
                </div>
              </section>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block border border-[#7a5230] bg-[#7a5230] px-4 py-2 text-sm font-medium text-white hover:bg-[#5f3d21] hover:border-[#5f3d21]"
                >
                  Open in Google Calendar
                </a>
              )}

              <Link
                href="/"
                className="inline-block border border-[#d8c8ae] bg-white px-4 py-2 text-sm font-medium text-[#5f3d21] hover:bg-[#f2eadb]"
              >
                Back to calendar
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
