'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { EventClickArg, ToolbarInput } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { rope } from './fonts'

const CALENDAR_ID =
  '21ad802c5543ccf34c04d088677c75c1828498534b5a6c23966b22bae955dac9@group.calendar.google.com'

type SubmissionState =
  | {
      status: 'idle'
      message: string
    }
  | {
      status: 'success' | 'error'
      message: string
    }

const initialSubmissionState: SubmissionState = {
  status: 'idle',
  message: '',
}

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>(initialSubmissionState)

  useEffect(() => {
    setMounted(true)

    function handleResize() {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault()

    const eventId = info.event.id
    if (!eventId) return

    const href =
      `/event/${encodeURIComponent(eventId)}` +
      `?calendarId=${encodeURIComponent(CALENDAR_ID)}`

    router.push(href)
  }

  function openModal() {
    setSubmissionState(initialSubmissionState)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSubmitting) return

    setIsModalOpen(false)
    setSubmissionState(initialSubmissionState)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)
    setSubmissionState(initialSubmissionState)

    try {
      const response = await fetch('/api/submit-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          eventName: formData.get('eventName'),
          eventDate: formData.get('eventDate'),
          venue: formData.get('venue'),
          location: formData.get('location'),
          website: formData.get('website'),
          details: formData.get('details'),
          botField: formData.get('company'),
        }),
      })

      const payload = (await response.json()) as { error?: string; ok?: boolean }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Unable to send your event right now.')
      }

      form.reset()
      setSubmissionState({
        status: 'success',
        message: 'Thanks! Your event submission has been sent.',
      })
    } catch (error) {
      setSubmissionState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
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
    <>
      <main className="flex h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
        <header className="flex-shrink-0 border-b border-[var(--border)] px-4 py-3">
          <div className="relative mx-auto flex max-w-7xl items-center justify-end gap-4 sm:min-h-[3.75rem]">
            <h1
              className={`${rope.className} pointer-events-none absolute left-1/2 -translate-x-1/2 text-center text-4xl tracking-[0.08em] uppercase sm:text-5xl`}
            >
              Honky Tonk LA
            </h1>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/community-links"
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brown-dark)] transition hover:border-[var(--brown)] hover:bg-[#f2eadb] sm:px-4 sm:text-sm"
              >
                Community Links
              </Link>

              <button
                type="button"
                onClick={openModal}
                className="rounded-md border border-[var(--brown)] bg-[var(--brown)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--surface)] transition hover:bg-[var(--brown-dark)] hover:border-[var(--brown-dark)] sm:px-4 sm:text-sm"
              >
                Submit Event
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
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
                expandRows
                dayMaxEventRows={mounted && isMobile ? 2 : 3}
                fixedWeekCount={false}
              />
            </div>
          </div>
        </div>

        <div className="h-4" />
      </main>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[rgba(47,36,24,0.55)] px-3 py-3 sm:items-center sm:px-4 sm:py-6"
          onClick={closeModal}
        >
          <div
            className="flex max-h-[min(90vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(47,36,24,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--brown-dark)] sm:text-2xl">
                  Submit an event
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Share the key details and we&apos;ll send them along by email.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-[var(--brown-dark)] sm:text-sm"
                disabled={isSubmitting}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Your name
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Your email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Event name
                  </span>
                  <input
                    name="eventName"
                    type="text"
                    required
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Event date
                  </span>
                  <input
                    name="eventDate"
                    type="text"
                    placeholder="Example: May 18, 2026 at 7 PM"
                    required
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Venue
                  </span>
                  <input
                    name="venue"
                    type="text"
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Location
                  </span>
                  <input
                    name="location"
                    type="text"
                    placeholder="City or address"
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Website or ticket link
                  </span>
                  <input
                    name="website"
                    type="url"
                    placeholder="https://"
                    className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>

                <label className="hidden" aria-hidden="true">
                  <span>Company</span>
                  <input
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-[var(--brown-dark)]">
                    Event details
                  </span>
                  <textarea
                    name="details"
                    rows={4}
                    required
                    placeholder="Share dancers, lesson times, cover charge, age restrictions, dress code, or anything else helpful."
                    className="min-h-28 w-full resize-y rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brown)]"
                  />
                </label>
              </div>

              {submissionState.message && (
                <p
                  className={`mt-3 text-sm ${
                    submissionState.status === 'error'
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--brown)]'
                  }`}
                >
                  {submissionState.message}
                </p>
              )}

              <div className="mt-4 flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--brown-dark)] transition hover:bg-[#f2eadb] hover:border-[var(--brown)]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--brown)] bg-[var(--brown)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--surface)] transition hover:bg-[var(--brown-dark)] hover:border-[var(--brown-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
