import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-4xl font-bold text-white mb-4">404</h2>
      <p className="text-gray-400 mb-6">Page not found</p>
      <Link href="/dashboard" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-semibold transition-colors">
        Go to Dashboard
      </Link>
    </div>
  )
}
