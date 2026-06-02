/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/api/registrars.json", destination: "/api/registrars.json" },
    ];
  },
};

export default nextConfig;
