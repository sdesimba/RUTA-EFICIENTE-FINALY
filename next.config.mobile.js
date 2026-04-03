/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Genera carpeta /out estática — necesario para Capacitor
  trailingSlash: true,     // Compatibilidad con file:// en Android
  images: {
    unoptimized: true,     // next/image no funciona en export estático
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Excluye las API routes del build estático (no existen en APK)
  // La app mobile debe apuntar a un backend externo via NEXT_PUBLIC_API_URL
};

module.exports = nextConfig;
