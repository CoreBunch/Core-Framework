export const minifyCss = (css: string, removeComments?: boolean): string => {
	return (
		css
			.replace(/\s+/g, " ")
			// .replace(/\/\*.*?\*\//g, "") // Remove comments
			.replace(/: /g, ":")
			.replace(/; /g, ";")
			.replace(/ {/g, "{")
			.replace(/} /g, "}")
			.replace(/{ /g, "{")
			.replace(/, /g, ",")
			.trim()
	);
};
