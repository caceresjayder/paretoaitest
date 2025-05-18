import type { NextConfig } from "next";
import CircularDependencyPlugin from 'circular-dependency-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  //check for circular dependencies with circular-dependency-plugin
  webpack: (config) => {
    config.plugins.push(new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }));
    return config;
  }
};

export default nextConfig;
