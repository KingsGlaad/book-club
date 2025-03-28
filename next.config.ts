import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "collegeinfogeek.com" },
      { hostname: "rnhfycqwsajfjhvibiuv.supabase.co" },
      { hostname: "muzbrplbdvihcqgshfdc.supabase.co" },
    ],
  },
};

export default nextConfig;
