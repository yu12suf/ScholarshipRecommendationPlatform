import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Force Daily's CJS build to avoid invalid source-map URL warnings in devtools.
      "@daily-co/daily-js$": "@daily-co/daily-js/dist/daily.js",
    };

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@daily-co\/daily-js/,
        message: /Failed to parse source map|Failed to get source map|Invalid URL/i,
      },
    ];

    return config;
  },
};

export default nextConfig;
