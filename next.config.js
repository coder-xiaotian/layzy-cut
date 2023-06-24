/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: '/tiktok',
      headers: [{
        key: "Cross-Origin-Embedder-Policy",
        value: "require-corp"
      }, {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin"
      }]
    }]
  }
}

module.exports = nextConfig
