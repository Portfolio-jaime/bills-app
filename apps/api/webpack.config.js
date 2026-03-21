const path = require('path')

module.exports = function (options, webpack) {
  return {
    ...options,
    // Externalize native/binary modules that webpack can't bundle
    externals: [
      ...(options.externals ?? []),
      // Keep Prisma client as external — it needs its generated binaries at runtime
      ({ request }, callback) => {
        if (
          request === '@prisma/client' ||
          request === 'prisma' ||
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
        // Resolve workspace packages directly from source for hot reload
        '@bills/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
        '@bills/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      },
    },
  }
}
