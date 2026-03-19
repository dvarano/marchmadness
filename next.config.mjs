/** @type {import('next').NextConfig} */
const isExport = process.env.STATIC_EXPORT === '1'

const nextConfig = {
  ...(isExport && {
    output: 'export',
    basePath: '/marchmadness',
    trailingSlash: true,
    images: { unoptimized: true },
  }),
}

export default nextConfig
