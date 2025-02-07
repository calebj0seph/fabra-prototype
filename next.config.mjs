/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a standalone build that we can containerise without needing to include node_modules
  output: 'standalone',
  async headers() {
    return [
      {
        // Ensure that we let the browser cache our model and texture assets
        source: '/:path*.(glb|webp)',
        headers: [
          {
            key: 'Cache-Control',
            // 24 hours
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
