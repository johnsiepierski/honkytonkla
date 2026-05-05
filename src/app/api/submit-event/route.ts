import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const RECIPIENT_EMAIL = 'johnsiepierski@gmail.com'
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  process.env.FROM_EMAIL ||
  'onboarding@resend.dev'

type SubmissionBody = {
  name?: unknown
  email?: unknown
  eventName?: unknown
  eventDate?: unknown
  venue?: unknown
  location?: unknown
  website?: unknown
  details?: unknown
  botField?: unknown
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function fieldMarkup(label: string, value: string) {
  if (!value) return ''

  return `<p style="margin:0 0 12px;"><strong>${escapeHtml(label)}:</strong><br />${escapeHtml(
    value,
  ).replaceAll('\n', '<br />')}</p>`
}

export async function POST(request: Request) {
  if (!resend) {
    return Response.json(
      { error: 'Missing RESEND_API_KEY on the server.' },
      { status: 500 },
    )
  }

  let body: SubmissionBody

  try {
    body = (await request.json()) as SubmissionBody
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = getString(body.name)
  const email = getString(body.email)
  const eventName = getString(body.eventName)
  const eventDate = getString(body.eventDate)
  const venue = getString(body.venue)
  const location = getString(body.location)
  const website = getString(body.website)
  const details = getString(body.details)
  const botField = getString(body.botField)

  if (botField) {
    return Response.json({ ok: true })
  }

  if (!name || !email || !eventName || !eventDate || !details) {
    return Response.json(
      { error: 'Please fill out all required fields.' },
      { status: 400 },
    )
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: `Honky Tonk LA event submission: ${eventName}`,
      text: [
        'A new event submission was received.',
        '',
        `Submitter: ${name}`,
        `Email: ${email}`,
        `Event name: ${eventName}`,
        `Event date: ${eventDate}`,
        venue ? `Venue: ${venue}` : '',
        location ? `Location: ${location}` : '',
        website ? `Website: ${website}` : '',
        '',
        'Details:',
        details,
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111111;">
          <h2 style="margin:0 0 16px;">New event submission</h2>
          ${fieldMarkup('Submitter', name)}
          ${fieldMarkup('Email', email)}
          ${fieldMarkup('Event name', eventName)}
          ${fieldMarkup('Event date', eventDate)}
          ${fieldMarkup('Venue', venue)}
          ${fieldMarkup('Location', location)}
          ${fieldMarkup('Website', website)}
          ${fieldMarkup('Details', details)}
        </div>
      `,
    })

    if (error) {
      console.error('Resend rejected event submission email', error)

      return Response.json(
        { error: error.message || 'Email provider rejected the submission.' },
        { status: 500 },
      )
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Failed to send event submission email', error)

    return Response.json(
      { error: 'Unable to send your event right now. Please try again later.' },
      { status: 500 },
    )
  }
}
