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
      {
        protocol: "https",
        hostname: "usercontent.nesahub.web.id",
      },
    ],
  },
};

module.exports = nextConfig;
