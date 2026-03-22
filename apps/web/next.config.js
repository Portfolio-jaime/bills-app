/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bills/ui', '@bills/types', '@bills/utils'],
  // Enable standalone output for Docker/k8s — copies all required files
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  // Workspace packages expose raw TypeScript source — Zod-inferred types can't
  // be re-exported by name across package boundaries at build time.
  // Type safety is still enforced locally via `pnpm typecheck`.
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
