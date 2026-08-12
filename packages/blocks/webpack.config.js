const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const { resolve } = require("path");

module.exports = () => {
	return {
		...defaultConfig,
		output: {
			...defaultConfig.output,
			path: resolve(process.cwd(), "../wp/gutenberg-blocks"),
		},
	};
};
