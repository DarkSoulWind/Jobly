/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		groupScope: "scope",
		groupVariants: ["hover", "focus"],
		extend: {},
	},
	// plugins: [require("tailwindcss-nested-groups")],
};
