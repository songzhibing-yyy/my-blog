/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 在服务端忽略这些模块
      config.externals.push({
        'react-native-sqlite-storage': 'commonjs react-native-sqlite-storage',
        '@sap/hana-client': 'commonjs @sap/hana-client',
        'hdb-pool': 'commonjs hdb-pool',
        'sql.js': 'commonjs sql.js',
        'sqlite3': 'commonjs sqlite3',
        'better-sqlite3': 'commonjs better-sqlite3',
        'ioredis': 'commonjs ioredis',
        'redis': 'commonjs redis',
        'mysql2': 'commonjs mysql2',
        'oracledb': 'commonjs oracledb',
        'pg': 'commonjs pg',
        'pg-native': 'commonjs pg-native',
        'typeorm-aurora-data-api-driver': 'commonjs typeorm-aurora-data-api-driver',
      });
    }

    // 忽略这些警告
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'react-native-sqlite-storage'/,
      /Module not found: Can't resolve '@sap\/hana-client/,
    ];

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['typeorm']
  }
};

module.exports = nextConfig;