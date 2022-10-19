/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {},
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
};

module.exports = nextConfig;
