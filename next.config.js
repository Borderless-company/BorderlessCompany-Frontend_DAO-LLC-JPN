/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config.js");
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "another-domain.com",
      },
    ],
    unoptimized: true,
  },
  i18n,
  // ESM module resolution の根本的解決
  experimental: {
    esmExternals: 'loose', // ESMの外部依存関係の処理を緩和
  },
  webpack: (config, { isServer }) => {
    // モジュール解決の改善
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
      '.cjs': ['.cjs', '.cts']
    };
    
    return config;
  },
  // トランスパイルするパッケージを包括的に指定
  transpilePackages: [
    // HeroUI関連パッケージを全て含める
    '@heroui/react',
    '@heroui/react-utils', 
    '@heroui/react-rsc-utils',
    '@heroui/use-aria-link',
    '@heroui/accordion',
    '@heroui/alert',
    '@heroui/button',
    '@heroui/divider',
    '@heroui/spinner',
    '@heroui/ripple',
    '@heroui/system',
    '@heroui/aria-utils',
    '@heroui/framer-utils',
    // React Aria関連パッケージ
    '@react-aria/utils',
    '@react-aria/interactions',
    '@react-aria/i18n',
    // Web3関連パッケージ  
    'thirdweb',
    'ox',
    '@adraffy/ens-normalize',
    'viem',
    '@rainbow-me/rainbowkit',
    'wagmi'
  ]
};

module.exports = nextConfig;
