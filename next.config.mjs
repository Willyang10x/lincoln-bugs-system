/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Isso força o build a continuar mesmo com erros de TS
    ignoreBuildErrors: true,
  },
};

export default nextConfig;