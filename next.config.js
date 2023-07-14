const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  // modularizeImports: {
  //   "@mui/material": {
  //     transform: "@mui/material/{{member}}",
  //   },
  // },
  experimental: {
    swcPlugins: [
      [
        "use-client",
        {
          include: ["@mui/material"],
        },
      ],
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
