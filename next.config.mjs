// next.config.mjs
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/anything-immersive-demos' : '';

const nextConfig = {
  basePath,
  ...(isProd
    ? {
        output: 'export',
        distDir: 'dist',
      }
    : {}),
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
