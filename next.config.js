// next.config.js
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion']
  }
};

export default nextConfig;
