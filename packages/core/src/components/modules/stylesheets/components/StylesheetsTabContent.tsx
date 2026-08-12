import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StylesheetGroup } from "../types";
import { validateCSS } from "../utils/validateCSS";
import { Tooltip } from "components/ui/Tooltip";
import { StylesheetsEditor } from "./StylesheetsEditor";

interface StylesheetsTabContentProps {
	stylesheet: StylesheetGroup;
	updateStylesheet: (props: { id: string; css: string; hasErrors?: boolean }) => void;
}

export const StylesheetsTabContent = memo<StylesheetsTabContentProps>(({ stylesheet, updateStylesheet }) => {
	const [css, setCss] = useState(stylesheet.css);
	const [validationStatus, setValidationStatus] = useState(() => validateCSS(stylesheet.css));
	const validationTimeoutRef = useRef<NodeJS.Timeout>();

	const handleCssChange = useCallback(
		(newCss: string) => {
			setCss(newCss);

			// Save CSS immediately
			updateStylesheet({
				id: stylesheet.id,
				css: newCss,
				// Don't update hasErrors immediately - wait for debounced validation
			});

			// Debounce validation (1.5 seconds after user stops typing)
			if (validationTimeoutRef.current) {
				clearTimeout(validationTimeoutRef.current);
			}

			validationTimeoutRef.current = setTimeout(() => {
				const validationResult = validateCSS(newCss);
				setValidationStatus(validationResult);

				// Update hasErrors flag after debounce
				updateStylesheet({
					id: stylesheet.id,
					css: newCss,
					hasErrors: !validationResult.isValid,
				});
			}, 1500);
		},
		[stylesheet.id, updateStylesheet],
	);

	const handleFormat = useCallback(() => {
		// Basic CSS formatting
		let formatted = css;

		// Add space after colons
		formatted = formatted.replace(/:\s*/g, ": ");

		// Add space after commas
		formatted = formatted.replace(/,\s*/g, ", ");

		// Format braces with proper indentation
		formatted = formatted.replace(/\s*{\s*/g, " {\n  ");
		formatted = formatted.replace(/;\s*/g, ";\n  ");
		formatted = formatted.replace(/\s*}\s*/g, "\n}\n");

		// Clean up extra whitespace
		formatted = formatted.replace(/\n\s*\n/g, "\n");
		formatted = formatted.replace(/  \n}/g, "\n}");
		formatted = formatted.trim();

		setCss(formatted);
		const validationResult = validateCSS(formatted);
		setValidationStatus(validationResult);
		updateStylesheet({
			id: stylesheet.id,
			css: formatted,
			hasErrors: !validationResult.isValid,
		});
	}, [css, stylesheet.id, updateStylesheet]);

	// Validate initial CSS on mount and cleanup on unmount
	useEffect(() => {
		handleCssChange(stylesheet.css);

		return () => {
			if (validationTimeoutRef.current) {
				clearTimeout(validationTimeoutRef.current);
			}
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, []);

	return (
		<div className="stylesheets-tab-content">
			<div className="generated-code-wrapper">
				<header>
					<div>
						<span className="red" />
						<span className="yellow" />
						<span className="green" />
					</div>
					<span className="center">{stylesheet.name}</span>
					<div className="editor-actions">
						{!validationStatus.isValid && (
							<Tooltip
								label={`${validationStatus.errors.length} error(s), ${validationStatus.warnings.length} warning(s)`}
							>
								<span className="validation-indicator error">⚠️ {validationStatus.errors.length}</span>
							</Tooltip>
						)}
						{validationStatus.isValid && validationStatus.warnings.length > 0 && (
							<Tooltip label={`${validationStatus.warnings.length} warning(s)`}>
								<span className="validation-indicator warning">⚡ {validationStatus.warnings.length}</span>
							</Tooltip>
						)}
						{validationStatus.isValid && validationStatus.warnings.length === 0 && css.length > 0 && (
							<Tooltip label="CSS is valid">
								<span className="validation-indicator success">✓</span>
							</Tooltip>
						)}
						<Tooltip label="Format CSS">
							<button className="btn-secondary btn-xs" onClick={handleFormat}>
								Format
							</button>
						</Tooltip>
					</div>
				</header>

				<div className="editor-container">
					<StylesheetsEditor value={css} onChange={handleCssChange} />
				</div>
			</div>
		</div>
	);
});
