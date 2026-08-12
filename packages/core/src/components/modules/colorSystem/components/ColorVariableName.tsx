import { memo, useState } from "react";
import { Checkmark } from "assets/icons/Checkmark.icon";
import { Copy } from "assets/icons/Copy.icon.";
import { useCopyToClipboard } from "hooks/useClipboard";
import { useDebounce } from "hooks/useDebounce";
import { useDidMountEffect } from "hooks/useDidMountEffect";
import { convertSafeCssName } from "utils";
import { Tooltip } from "components/ui/Tooltip";

interface ColorVariableName {
	value: string;
	onChange: (value: string) => void;
}

export const ColorVariableName = memo<ColorVariableName>(({ value, onChange }) => {
	const [name, setName] = useState(value);
	const { isCopied: isSelectorCopied, copy: copySelector } = useCopyToClipboard();

	const debouncedName = useDebounce(name, 0);

	useDidMountEffect(() => {
		if (value !== debouncedName) onChange(debouncedName);
	}, [debouncedName]);

	return (
		<Tooltip label="Color name / CSS variable" withArrow>
			<div className="prefixed-input-container input-wrapper">
				<span>--</span>
				<input
					onChange={(e) => setName(convertSafeCssName(e.target.value))}
					value={name}
					type="text"
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
				/>

				<div className="copy" onClick={() => copySelector(`var(--${value})`)}>
					{isSelectorCopied ? <Checkmark /> : <Copy />}
				</div>
			</div>
		</Tooltip>
	);
});

ColorVariableName.displayName = "ColorVariableName";
