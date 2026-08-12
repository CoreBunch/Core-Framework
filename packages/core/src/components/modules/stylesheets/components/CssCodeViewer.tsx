import { memo, useMemo } from "react";
import { css } from "@codemirror/lang-css";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useAtomValue } from "jotai";
import { themeModeAtom } from "state/themeAtoms";

interface CssCodeViewerProps {
	value: string;
	height?: string;
}

export const CssCodeViewer = memo<CssCodeViewerProps>(({ value, height = "100%" }) => {
	const themeMode = useAtomValue(themeModeAtom);

	// Theme configuration based on app theme
	const getThemeColors = () => {
		switch (themeMode) {
			case "light":
				return {
					background: "#e4e4e4", // --bg-primary for light theme
					text: "#1a1a1a",
					cursor: "#000",
					selection: "rgba(0, 120, 215, 0.3)",
					gutterBg: "#d8d8d8",
					gutterBorder: "#c0c0c0",
					activeLineGutter: "#cccccc",
				};
			case "gray":
				return {
					background: "#252525", // --bg-primary for gray theme
					text: "#e0e0e0",
					cursor: "#fff",
					selection: "rgba(100, 150, 255, 0.3)",
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
					selection: "rgba(100, 150, 255, 0.3)",
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
			EditorView.editable.of(false), // Make it read-only
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
				// Selection styling
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
			}),
		],
		[themeColors],
	);

	return (
		<CodeMirror
			value={value}
			extensions={extensions}
			theme={themeMode === "light" ? "light" : "dark"}
			height={height}
			editable={false}
			basicSetup={{
				lineNumbers: true,
				foldGutter: true,
				dropCursor: false,
				allowMultipleSelections: true,
				indentOnInput: false,
				bracketMatching: true,
				closeBrackets: false,
				autocompletion: false,
				rectangularSelection: true,
				highlightSelectionMatches: false,
				searchKeymap: true,
			}}
		/>
	);
});
