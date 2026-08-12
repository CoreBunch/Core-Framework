import postcss from "postcss";

export interface ValidationError {
	line: number;
	column: number;
	message: string;
	type: "error" | "warning";
	from?: number;
	to?: number;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
}

export function validateCSS(css: string): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationError[] = [];

	// Skip validation for empty content
	if (!css.trim()) {
		return { isValid: true, errors: [], warnings: [] };
	}

	try {
		// Parse CSS with PostCSS
		const ast = postcss.parse(css, { from: undefined });

		// Walk through AST to find issues
		ast.walkRules((rule) => {
			// Check for invalid double dots in selectors
			if (rule.selector && /\.\./.test(rule.selector)) {
				const source = rule.source;
				if (source?.start) {
					errors.push({
						line: source.start.line,
						column: source.start.column,
						message: "Invalid double dot in selector",
						type: "error",
					});
				}
			}

			// Check for empty rule blocks
			if (!rule.nodes || rule.nodes.length === 0) {
				const source = rule.source;
				if (source?.start) {
					warnings.push({
						line: source.start.line,
						column: source.start.column,
						message: "Empty rule block",
						type: "warning",
					});
				}
			}
		});

		ast.walkDecls((decl) => {
			// Check for missing semicolons
			if (decl.raws && decl.raws.semicolon === false) {
				const source = decl.source;
				if (source?.start) {
					warnings.push({
						line: source.start.line,
						column: source.start.column,
						message: "Missing semicolon",
						type: "warning",
					});
				}
			}

			// Check for empty property values
			if (!decl.value || decl.value.trim() === "") {
				const source = decl.source;
				if (source?.start) {
					errors.push({
						line: source.start.line,
						column: source.start.column,
						message: "Empty property value",
						type: "error",
					});
				}
			}
		});
	} catch (e: any) {
		// Parse error - this means there's a syntax error
		if (e.name === "CssSyntaxError") {
			const line = e.line || 1;
			const column = e.column || 1;
			const lines = css.split("\n");

			let from = 0;
			for (let i = 0; i < line - 1; i++) {
				from += lines[i].length + 1;
			}
			from += column - 1;

			errors.push({
				line,
				column,
				message: e.reason || "CSS syntax error",
				type: "error",
				from,
				to: from + 1,
			});
		} else {
			// Unknown error
			errors.push({
				line: 1,
				column: 1,
				message: "Failed to parse CSS",
				type: "error",
				from: 0,
				to: 1,
			});
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}
