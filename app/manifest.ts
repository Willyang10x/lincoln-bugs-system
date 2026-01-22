import { MetadataRoute } from 'next'

// --- CORREÇÃO: Força o arquivo a ser estático para o Electron ---
export const dynamic = 'force-static'
// ----------------------------------------------------------------

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finance.OS',
    short_name: 'Finance.OS',
    description: 'Sistema Operacional Financeiro',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}