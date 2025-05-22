/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.giphy.com",
      },
      {
        protocol: "https",
        hostname: "nhdevcdn.zeth.biz.id",
      },
    ],
  },
};

module.exports = nextConfig;
