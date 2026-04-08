/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Konva tries to import the 'canvas' package for Node.js SSR — we don't need it
    // since InfiniteCanvas is loaded with ssr: false via next/dynamic
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
