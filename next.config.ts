import type { NextConfig } from "next";

const configLoader = () => {
  if (process.env.VERCEL) {
    return {
      output: "standalone"
    } satisfies NextConfig;
  }

  return {
    output: "export"
  } satisfies NextConfig;
};

const nextConfig = configLoader();

export default nextConfig;
