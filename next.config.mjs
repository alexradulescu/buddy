/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        // 👇 matches all routes except /api
        source: '/((?!api/).*)',
        destination: '/static-app-shell'
      }
    ]
  }
}

export default nextConfig
