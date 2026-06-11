/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  eslint: {
    // Build vaqtida lint xatolari to'xtatmasin (alohida `npm run lint` bor)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
