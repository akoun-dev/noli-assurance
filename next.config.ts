import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // ✅ Sécurité: Activer les vérifications TypeScript
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: true, // ✅ Sécurité: Activer React Strict Mode pour le développement
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: false, // ✅ Sécurité: Activer les vérifications ESLint en production
  },
  // ✅ Sécurité: Configuration des en-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// Exporter la configuration avec Sentry
export default withSentryConfig(nextConfig, {
  // Options supplémentaires pour Sentry
  silent: true, // Réduire le bruit dans les logs
  sourcemaps: {
    disable: true, // Désactiver les source maps en production
  },
});
