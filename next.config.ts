import type { NextConfig } from "next";

/**
 * A fully static export.
 *
 * Every route in this app is a client component — there are no route
 * handlers, no server actions and nothing reading headers or cookies — so
 * there is no server to run. "standalone" was the wrong target: it builds a
 * Node server bundle for Docker or a VM, which a static host has no way to
 * execute, so every path fell through to the host's own 404.
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
