const nextConfig = {
  output: 'export',      // <--- OBRIGATÓRIO
  images: {
    unoptimized: true,   // <--- OBRIGATÓRIO
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;