import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Bauskript (scripts/bauen.sh) baut in einen eigenen Ordner, damit der laufende Dienst nie unterbrochen wird (Regel 10).
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

export default nextConfig
