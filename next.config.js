/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Configure Turbopack root to this app directory to avoid wrong workspace detection
  turbopack: {
    root: path.resolve(__dirname)
  },
  eslint: {
    // Do not block production builds on ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  // Handle pdf-parse as external package to avoid ESM/CommonJS issues
  serverExternalPackages: ['pdf-parse'],
}

module.exports = nextConfig
