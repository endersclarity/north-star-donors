import type { NextConfig } from "next";

// Vercel sets VERCEL=1 during builds; GitHub Actions does not.
// On Vercel we deploy at root (master-portal-fork.vercel.app), so no basePath / no static export.
// On GitHub Pages we deploy under /north-star-donors/, so static export with basePath.
const isVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  ...(isVercel
    ? {}
    : {
        output: 'export',
        basePath: '/north-star-donors',
        trailingSlash: true,
      }),
  images: { unoptimized: true },
};

export default nextConfig;
