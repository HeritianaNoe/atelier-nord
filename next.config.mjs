/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Admins can paste any https image URL, so allow all https hosts.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
