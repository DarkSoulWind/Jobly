/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		groupScope: "scope",
		groupVariants: ["hover", "focus"],
		extend: {},
	},
	// plugins: [require("tailwindcss-nested-groups")],
};
