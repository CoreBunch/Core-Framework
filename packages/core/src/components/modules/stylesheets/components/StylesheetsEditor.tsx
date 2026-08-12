import { memo, useCallback, useMemo } from "react";
import { useStylesheetsAutocomplete } from "../hooks/useStylesheetsAutocomplete";
import { AutocompleteItem } from "../types";
import { validateCSS } from "../utils/validateCSS";
import { CompletionContext, CompletionResult, autocompletion } from "@codemirror/autocomplete";
import { css } from "@codemirror/lang-css";
import { Diagnostic, linter } from "@codemirror/lint";
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	drawSelection,
} from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useAtomValue } from "jotai";
import { cssReference } from "cssGenerator/readOnly/cssReference";
import { themeModeAtom } from "state/themeAtoms";

interface StylesheetsEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export const StylesheetsEditor = memo<StylesheetsEditorProps>(({ value, onChange }) => {
	const themeMode = useAtomValue(themeModeAtom);
	const autocompleteData = useStylesheetsAutocomplete();

	// Get CSS properties for autocomplete
	const cssProperties = useMemo(() => {
		return Object.keys(cssReference).map((prop) => ({
			label: prop,
			type: "property",
			detail: "CSS Property",
		}));
	}, []);

	// Create CodeMirror autocomplete source
	const cfAutocomplete = useCallback(
		(context: CompletionContext): CompletionResult | null => {
			// First try to match a dot followed by word characters
			let word = context.matchBefore(/\.[\w-]*/);
			let hasDotPrefix = false;

			if (word && word.text.startsWith(".")) {
				hasDotPrefix = true;
			} else {
				// If no dot, just match word characters (including hyphens for CSS properties)
				word = context.matchBefore(/[\w-]*/);
			}

			if (!word || (word.from === word.to && !context.explicit)) {
				return null;
			}

			const beforeCursor = context.state.doc.sliceString(Math.max(0, word.from - 100), word.from);
			const afterCursor = context.state.doc.sliceString(
				word.to,
				Math.min(context.state.doc.length, word.to + 10),
			);

			// Check if we're inside a declaration block (between { and })
			const lastOpenBrace = beforeCursor.lastIndexOf("{");
			const lastCloseBrace = beforeCursor.lastIndexOf("}");
			const isInDeclarationBlock = lastOpenBrace > lastCloseBrace;

			// Check if we're writing a property (at the start of a line or after a semicolon)
			const isWritingProperty =
				isInDeclarationBlock &&
				(/[{;]\s*[\w-]*$/.test(beforeCursor) || /^\s*[\w-]*$/.test(beforeCursor.split("\n").pop() || ""));

			// Determine context for smart suggestions
			const isInPropertyValue = /:\s*[\w-]*$/.test(beforeCursor) && isInDeclarationBlock;
			const isInSelector =
				!isInDeclarationBlock && (hasDotPrefix || /^\s*\.?[\w-]*$/.test(beforeCursor.trim()));
			const isLookingForVariable = /var\(\s*-*$/.test(beforeCursor) || /:\s*var\(\s*-*$/.test(beforeCursor);

			let options: any[] = [];

			// Filter based on context
			if (isLookingForVariable) {
				// Only show variables when inside var()
				options = autocompleteData.filter((item) => item.type === "variable");
			} else if (isWritingProperty) {
				// Show CSS properties when writing a property
				options = cssProperties;
			} else if (isInSelector) {
				// Show classes when writing selectors
				options = autocompleteData.filter((item) => item.type === "class");
			} else if (isInPropertyValue) {
				// Get the property name to suggest appropriate values
				const propertyMatch = beforeCursor.match(/([\w-]+)\s*:\s*[\w-]*$/);
				if (propertyMatch) {
					const propertyName = propertyMatch[1];
					const propertyData = cssReference[propertyName as keyof typeof cssReference];

					if (propertyData && propertyData.values) {
						// Create options from property values
						const valueOptions = propertyData.values
							.filter((val: string) => !val.startsWith("[") && !val.includes("{")) // Filter out placeholders
							.map((val: string) => ({
								label: val,
								type: "value",
								detail: `Value for ${propertyName}`,
							}));

						// Also include variables for all property values
						const variableOptions = autocompleteData.filter((item) => item.type === "variable");

						options = [...valueOptions, ...variableOptions];
					} else {
						// If no specific values, just show variables
						options = autocompleteData.filter((item) => item.type === "variable");
					}
				} else {
					// Fallback to variables
					options = autocompleteData.filter((item) => item.type === "variable");
				}
			}

			// Filter by current input (remove the dot for matching if present)
			const searchText = hasDotPrefix ? word.text.slice(1) : word.text;
			const currentWord = searchText.toLowerCase();
			const filtered = options.filter((item) => item.label.toLowerCase().includes(currentWord));

			if (filtered.length === 0) {
				return null;
			}

			return {
				from: word.from,
				to: word.to,
				options: filtered.map((item) => ({
					label: item.label,
					type: item.type,
					// Apply the replacement - it already includes the dot for classes
					apply: item.apply || item.label,
					detail: item.detail,
					info: item.color
						? () => {
								const el = document.createElement("div");
								el.style.display = "flex";
								el.style.alignItems = "center";
								el.style.gap = "8px";

								const colorBox = document.createElement("div");
								colorBox.style.width = "20px";
								colorBox.style.height = "20px";
								colorBox.style.backgroundColor = item.color || "";
								colorBox.style.border = "1px solid #ccc";
								colorBox.style.borderRadius = "2px";

								const text = document.createElement("span");
								text.textContent = item.color || "";

								el.appendChild(colorBox);
								el.appendChild(text);

								return el;
						  }
						: undefined,
				})),
				filter: false,
			};
		},
		[autocompleteData, cssProperties],
	);

	// CSS linter using shared validation
	const cssLinter = useCallback(() => {
		return (view: EditorView): Diagnostic[] => {
			const diagnostics: Diagnostic[] = [];
			const doc = view.state.doc.toString();

			// Use shared validation
			const validationResult = validateCSS(doc);

			// Convert validation errors to CodeMirror diagnostics
			[...validationResult.errors, ...validationResult.warnings].forEach((error) => {
				// Use pre-calculated positions if available
				if (error.from !== undefined && error.to !== undefined) {
					diagnostics.push({
						from: error.from,
						to: error.to,
						severity: error.type,
						message: error.message,
					});
				} else {
					// Fallback: calculate position from line/column
					const lines = doc.split("\n");
					let from = 0;
					for (let i = 0; i < error.line - 1; i++) {
						from += lines[i].length + 1;
					}
					from += error.column - 1;

					// Estimate the error length
					const currentLine = lines[error.line - 1] || "";
					let errorLength = Math.min(20, currentLine.length - (error.column - 1));

					diagnostics.push({
						from,
						to: from + Math.max(1, errorLength),
						severity: error.type,
						message: error.message,
					});
				}
			});

			return diagnostics;
		};
	}, []);

	// Create error line decorations plugin
	const errorLinePlugin = ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView) {
				const decorations: any[] = [];
				const doc = view.state.doc.toString();
				const validationResult = validateCSS(doc);

				// Group errors and warnings by line with their severity
				const issuesByLine = new Map<number, { message: string; severity: "error" | "warning" }>();

				// Process errors first (higher priority)
				validationResult.errors.forEach((error) => {
					const lineNum = error.line;
					if (!issuesByLine.has(lineNum)) {
						issuesByLine.set(lineNum, { message: error.message, severity: "error" });
					}
				});

				// Then process warnings (only if no error on that line)
				validationResult.warnings.forEach((warning) => {
					const lineNum = warning.line;
					if (!issuesByLine.has(lineNum)) {
						issuesByLine.set(lineNum, { message: warning.message, severity: "warning" });
					}
				});

				// Create decorations for each line with issues
				issuesByLine.forEach((issue, lineNum) => {
					const line = view.state.doc.line(lineNum);

					// Line decoration with appropriate class based on severity
					decorations.push(
						Decoration.line({
							class: issue.severity === "error" ? "cm-error-line" : "cm-warning-line",
							attributes: {
								"data-message": issue.message,
							},
						}).range(line.from),
					);
				});

				return Decoration.set(decorations);
			}
		},
		{
			decorations: (v) => v.decorations,
		},
	);

	// Theme configuration based on app theme
	const getThemeColors = () => {
		switch (themeMode) {
			case "light":
				return {
					background: "#e4e4e4", // --bg-primary for light theme
					text: "#1a1a1a",
					cursor: "#000",
					selection: "rgba(0, 120, 215, 0.3)", // More visible blue selection
					gutterBg: "#d8d8d8",
					gutterBorder: "#c0c0c0",
					activeLineGutter: "#cccccc",
				};
			case "gray":
				return {
					background: "#252525", // --bg-primary for gray theme
					text: "#e0e0e0",
					cursor: "#fff",
					selection: "rgba(100, 150, 255, 0.3)", // More visible blue selection
					gutterBg: "#1a1a1a",
					gutterBorder: "#3a3a3a",
					activeLineGutter: "#2f2f2f",
				};
			case "dark":
			default:
				return {
					background: "#1b1e26", // --bg-primary for dark theme
					text: "#e0e0e0",
					cursor: "#fff",
					selection: "rgba(100, 150, 255, 0.3)", // More visible blue selection
					gutterBg: "#14161c",
					gutterBorder: "#2a2d35",
					activeLineGutter: "#22252d",
				};
		}
	};

	const themeColors = getThemeColors();

	const extensions = useMemo(
		() => [
			css(),
			drawSelection(),
			autocompletion({
				override: [cfAutocomplete],
				icons: true,
				defaultKeymap: true,
			}),
			// Removed linter to eliminate hover tooltips - we use inline messages instead
			errorLinePlugin,
			EditorView.lineWrapping,
			EditorView.theme({
				"&": {
					fontSize: "12px",
					backgroundColor: themeColors.background,
				},
				".cm-content": {
					padding: "12px",
					fontFamily:
						'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
					backgroundColor: themeColors.background,
					color: themeColors.text,
				},
				// Target all text elements inside CodeMirror
				".cm-content *": {
					fontFamily:
						'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
				},
				".cm-line": {
					fontFamily:
						'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
				},
				".cm-focused .cm-cursor": {
					borderLeftColor: themeColors.cursor,
				},
				".cm-gutters": {
					backgroundColor: themeColors.gutterBg,
					borderRight: `1px solid ${themeColors.gutterBorder}`,
					color: themeColors.text,
				},
				".cm-activeLineGutter": {
					backgroundColor: themeColors.activeLineGutter,
				},
				".cm-activeLine": {
					backgroundColor: "transparent",
				},
				// Selection styling - force visibility
				".cm-selectionBackground": {
					backgroundColor: `${themeColors.selection} !important`,
				},
				".cm-selectionLayer": {
					pointerEvents: "none",
				},
				"& .cm-scroller": {
					position: "relative",
				},
				"& .cm-scroller .cm-selectionLayer": {
					zIndex: "auto !important",
				},
				"& .cm-scroller .cm-selectionLayer .cm-selectionBackground": {
					backgroundColor: `${themeColors.selection} !important`,
				},
				// Linter styles
				".cm-lintRange-error": {
					backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'6'%20height%3D'3'%3E%3Cpath%20d%3D'm0%2C2.5%20l2%2C-2%202%2C2%202%2C-2'%20stroke%3D'%23ff5555'%20fill%3D'none'%20stroke-width%3D'.7'%2F%3E%3C%2Fsvg%3E")`,
					backgroundPosition: "left bottom",
					backgroundRepeat: "repeat-x",
					paddingBottom: "3px",
				},
				".cm-lintRange-warning": {
					backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'6'%20height%3D'3'%3E%3Cpath%20d%3D'm0%2C2.5%20l2%2C-2%202%2C2%202%2C-2'%20stroke%3D'%23f1fa8c'%20fill%3D'none'%20stroke-width%3D'.7'%2F%3E%3C%2Fsvg%3E")`,
					backgroundPosition: "left bottom",
					backgroundRepeat: "repeat-x",
					paddingBottom: "3px",
				},
				".cm-diagnostic-error": {
					borderLeft: "3px solid #ff5555",
					paddingLeft: "8px",
					marginLeft: "-11px",
				},
				".cm-diagnostic-warning": {
					borderLeft: "3px solid #f1fa8c",
					paddingLeft: "8px",
					marginLeft: "-11px",
				},
				".cm-lintPoint-error:after": {
					borderBottomColor: "#ff5555",
				},
				".cm-lintPoint-warning:after": {
					borderBottomColor: "#f1fa8c",
				},
				".cm-panel.cm-panel-lint": {
					backgroundColor: themeColors.background,
					borderTop: `1px solid ${themeColors.gutterBorder}`,
					color: themeColors.text,
				},
				// Error line styling with inline message
				".cm-error-line": {
					backgroundColor: "rgba(255, 0, 0, 0.1)",
					position: "relative",
					"&::after": {
						content: "attr(data-message)",
						position: "absolute",
						right: "10px",
						top: "50%",
						transform: "translateY(-50%)",
						fontSize: "12px",
						color: "#ff6b6b",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						padding: "2px 8px",
						borderRadius: "3px",
						whiteSpace: "nowrap",
						maxWidth: "300px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						pointerEvents: "none",
						zIndex: 10,
					},
				},
				// Warning line styling with inline message
				".cm-warning-line": {
					backgroundColor: "rgba(255, 255, 0, 0.1)",
					position: "relative",
					"&::after": {
						content: "attr(data-message)",
						position: "absolute",
						right: "10px",
						top: "50%",
						transform: "translateY(-50%)",
						fontSize: "12px",
						color: "#f1fa8c",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						padding: "2px 8px",
						borderRadius: "3px",
						whiteSpace: "nowrap",
						maxWidth: "300px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						pointerEvents: "none",
						zIndex: 10,
					},
				},
				// Autocomplete dropdown styling
				".cm-tooltip-autocomplete .cm-completionDetail": {
					opacity: 0.5,
					fontStyle: "italic",
				},
				".cm-tooltip-autocomplete .cm-completionLabel": {
					opacity: 1,
					fontWeight: "normal",
				},
			}),
		],
		[cfAutocomplete, errorLinePlugin, themeColors],
	);

	const handleChange = useCallback(
		(val: string) => {
			onChange(val);
		},
		[onChange],
	);

	return (
		<CodeMirror
			value={value}
			onChange={handleChange}
			extensions={extensions}
			theme={themeMode === "light" ? "light" : "dark"}
			height="100%"
			basicSetup={{
				lineNumbers: true,
				foldGutter: true,
				dropCursor: true,
				allowMultipleSelections: true,
				indentOnInput: true,
				bracketMatching: true,
				closeBrackets: true,
				autocompletion: true,
				rectangularSelection: true,
				highlightSelectionMatches: false,
				searchKeymap: true,
			}}
		/>
	);
});
