/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'vohlymyegztabzgikbqv.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    experimental: {
        // Required for some Sharp operations in some environments if needed
    },
};

export default nextConfig;
