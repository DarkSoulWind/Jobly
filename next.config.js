/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
        swcPlugins: [
            "next-superjson-plugin",
            {
                excluded: []
            }
        ]
    },
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
};

module.exports = nextConfig;
