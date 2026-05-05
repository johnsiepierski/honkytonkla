import Link from 'next/link'

export default function EventNotFound() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Event not found</h1>
        <p className="mt-3 text-neutral-600">
          This event may have been removed or the link may be invalid.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Back to calendar
        </Link>
      </div>
    </main>
  )
}
