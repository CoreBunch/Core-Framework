const { resolve } = require("path");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const fs = require("fs");
const glob = require("glob");

const rename = () => {
	const { join } = path;

	const blockJsonFiles = glob.sync(join(process.cwd(), "build", "**", "block.json"));

	if (blockJsonFiles) {
		blockJsonFiles.forEach((filePath) => {
			const blockJson = require(filePath);

			if (blockJson?.editorScript) {
				blockJson.editorScript = blockJson.editorScript.replace(".tsx", ".js");
			}

			if (blockJson?.script) {
				blockJson.script = blockJson.script.replace(".tsx", ".js");
			}

			if (blockJson?.viewScript) {
				blockJson.viewScript = blockJson.viewScript.replace(".tsx", ".js");
			}

			if (blockJson?.editorStyle) {
				blockJson.editorStyle = blockJson.editorStyle.replace(".scss", ".css");
			}

			if (blockJson?.style) {
				blockJson.style = blockJson.style.replace(".scss", ".css");
			}

			fs.writeFile(filePath, JSON.stringify(blockJson, null, 2), function writeJSON(error) {
				if (error) {
					return console.log(error);
				}
			});
		});
	}
};

module.exports = (env) => {
	return {
		...defaultConfig,
		module: {
			...defaultConfig.module,
		},
		devServer: {
			...defaultConfig.devServer,
			allowedHosts: "all",
		},
		output: {
			...defaultConfig.output,
			path: resolve(process.cwd(), "../wp/gutenberg"),
		},
		plugins: [
			...defaultConfig.plugins,
			{
				apply: (compiler) => {
					compiler.hooks.afterEmit.tap("rename", rename);
				},
			},
		],
	};
};
