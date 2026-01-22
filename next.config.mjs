/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- ESSENCIAL: Gera a pasta 'out' com HTML estático para o Electron ler
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Necessário pois não teremos servidor de imagens
  },
}

export default nextConfig