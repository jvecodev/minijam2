/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desativamos a exportação estática e usaremos o servidor de desenvolvimento
  // para páginas que usam APIs do navegador
  trailingSlash: true,
}

export default nextConfig
