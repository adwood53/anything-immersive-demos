// next.config.mjs
/** @type {import('next').NextConfig} */
const isProd = (process.env.node = 'production');

const nextConfig = {
  basePath: isProd ? '/anything-immersive-demos' : '',
  output: 'export',
  reactStrictMode: true,
  distDir: 'dist',
};

export default nextConfig;
