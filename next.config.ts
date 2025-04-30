import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

// Import next-intl plugin
const withIntl = withNextIntl("./i18n.ts");

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["randomuser.me"],
  },
};

export default withIntl(nextConfig);
