/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },

  // Explicitly disable Turbopack
  experimental: {
    turbo: false
  }
};

export default nextConfig;
