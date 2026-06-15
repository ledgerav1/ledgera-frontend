/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Document-Policy",
            value: "js-profiling",
          },
        ],
      },
    ];
  },
};

const { withSentryConfig } = require("@sentry/nextjs");

const sentryWebpackOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: "ledgera-global-inc",
  project: "javascript-nextjs",
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackOptions);
