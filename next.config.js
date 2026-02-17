/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BASE_URL || "http://localhost:4242"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
