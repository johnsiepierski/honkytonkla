import Link from 'next/link'

const communityLinks = [
  {
    label: 'The Honky Tonk Hunnies on Instagram',
    href: 'https://www.instagram.com/thehonkytonkhunnies/',
  },
  {
    label: 'Buckbrush Hall on Instagram',
    href: 'https://www.instagram.com/buckbrushhall/',
  },
  {
    label: 'Strictly Honky Tonk on Instagram',
    href: 'https://www.instagram.com/strictlyhonkytonk/',
  },
  {
    label: 'Grand Ole Country Bunker on Instagram',
    href: 'https://www.instagram.com/grandolecountrybunker/',
  },
  {
    label: 'Stud Country',
    href: 'https://studcountry.us/',
  },
]

export default function CommunityLinksPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-block text-sm font-medium text-[var(--brown)] hover:text-[var(--brown-dark)]"
        >
          ← Back to calendar
        </Link>

        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-6 shadow-[0_18px_50px_rgba(47,36,24,0.08)] sm:px-8 sm:py-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--brown-dark)] sm:text-4xl">
            Community Links
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            A few places to keep up with the local honky tonk community.
          </p>

          <div className="mt-6 space-y-3">
            {communityLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-[var(--border)] bg-white px-4 py-4 text-[var(--brown-dark)] transition hover:border-[var(--brown)] hover:bg-[#fdf4e5]"
              >
                <div className="text-base font-semibold">{item.label}</div>
                <div className="mt-1 text-sm text-[var(--accent)]">
                  {item.href}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
