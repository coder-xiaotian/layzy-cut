/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [{
        key: "Cross-Origin-Embedder-Policy",
        value: "require-corp"
      }, {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin"
      }]
    }]
  },
  experimental: {
    swcPlugins: [
      [
        'use-client',
        {
          include: ["@mui/material"]
        }
      ],
    ]
  }
}

module.exports = nextConfig
