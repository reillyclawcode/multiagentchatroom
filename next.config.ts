import type { NextConfig } from "next";

const isGitHub = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = isGitHub && repoName ? `/${repoName}` : undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
