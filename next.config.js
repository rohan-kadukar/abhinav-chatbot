/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*', // This should be more restrictive in production
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL', // Allow embedding in iframes
                    }
                ],
            },
        ]
    },
}

module.exports = nextConfig
  