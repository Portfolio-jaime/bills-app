const path = require('path')

module.exports = function (options, webpack) {
  // Override all .ts/.tsx rules to use transpileOnly — skips type checking and
  // rootDir enforcement, which is needed for monorepo packages outside apps/api/src.
  const rules = (options.module?.rules ?? []).map((rule) => {
    if (rule.test instanceof RegExp && rule.test.test('file.ts')) {
      return {
        ...rule,
        use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
      }
    }
    return rule
  })

  // Remove ForkTsCheckerWebpackPlugin — it runs a full type-check that enforces
  // rootDir restrictions even when ts-loader uses transpileOnly.
  const plugins = (options.plugins ?? []).filter(
    (p) => p.constructor?.name !== 'ForkTsCheckerWebpackPlugin',
  )

  return {
    ...options,
    module: { ...options.module, rules },
    plugins,
    // Do NOT spread options.externals — NestJS CLI sets nodeExternals() which
    // marks all node_modules as external. In Docker we need a single self-
    // contained bundle, so we only externalize truly native modules.
    externals: [
      // @prisma/client has native query-engine binaries — must stay external
      ({ request }, callback) => {
        if (
          request === '@prisma/client' ||
          /^@prisma\//.test(request)
        ) {
          return callback(null, 'commonjs ' + request)
        }
        callback()
      },
    ],
    resolve: {
      ...options.resolve,
      alias: {
        // Resolve workspace packages directly from source for bundling
        '@bills/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
        '@bills/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      },
    },
  }
}
