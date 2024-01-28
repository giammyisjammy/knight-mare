// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  staticPageGenerationTimeout: 300,
  images: {
    remotePatterns: [
      { hostname: 'www.notion.so' },
      { hostname: 'notion.so' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'pbs.twimg.com' },
      { hostname: 'abs.twimg.com' },
      { hostname: 's3.us-west-2.amazonaws.com' },
      { hostname: '**.vercel.app' },
      { hostname: 'circoloscacchicantu.it' },
      { hostname: 'circoloscacchicantu.com' },
      { hostname: 'circoloscacchicantu.org' },
      { hostname: 'cantuchess.club' }
    ].map((pattern) => ({ ...pattern, protocol: 'https' })),
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
})
