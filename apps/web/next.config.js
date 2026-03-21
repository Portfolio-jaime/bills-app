/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bills/ui', '@bills/types', '@bills/utils'],
  // Enable standalone output for Docker/k8s — copies all required files
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
}

module.exports = nextConfig
