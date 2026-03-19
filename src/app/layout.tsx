import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'March Madness Pool',
  description: 'Knockout Pool Analytics Dashboard',
}

const isStaticExport = process.env.STATIC_EXPORT === '1'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/entries', label: 'Entries' },
  { href: '/teams', label: 'Teams' },
  { href: '/analytics', label: 'Analytics' },
  ...(!isStaticExport ? [{ href: '/admin', label: 'Admin' }] : []),
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        <nav className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14">
            <span className="text-orange-400 font-bold text-lg mr-6">MM Pool</span>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
