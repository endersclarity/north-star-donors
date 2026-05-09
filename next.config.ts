import type { NextConfig } from "next";

// On GitHub Pages we deploy under /north-star-donors/, so static export with basePath.
// Local dev and Vercel/Mirror run at root.
const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: '/north-star-donors',
        trailingSlash: true,
      }
    : {}),
  images: { unoptimized: true },
};

export default nextConfig;
