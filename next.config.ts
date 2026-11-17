import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@mantine/core", "@mantine/hooks"]
};

export default nextConfig;
