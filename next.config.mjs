/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'lodash'],
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
