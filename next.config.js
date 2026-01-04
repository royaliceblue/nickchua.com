import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  process.env.__NEXT_PRIVATE_ORIGIN ||
  'http://localhost:3000'

const remotePatternsFromEnv = [
  process.env.NEXT_PUBLIC_SERVER_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
  process.env.__NEXT_PRIVATE_ORIGIN,
  'http://localhost:3000',
].flatMap((item) => {
  if (!item) return []

  try {
    const url = new URL(item)
    return [
      {
        hostname: url.hostname,
        protocol: url.protocol.replace(':', ''),
      },
    ]
  } catch {
    return []
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...remotePatternsFromEnv,
      {
        hostname: 'localhost',
        protocol: 'http',
      },
      {
        hostname: '127.0.0.1',
        protocol: 'http',
      },
      {
        hostname: 'public.blob.vercel-storage.com',
        protocol: 'https',
      },
      {
        hostname: '*.public.blob.vercel-storage.com',
        protocol: 'https',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
