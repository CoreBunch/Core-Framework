import { memo } from "react";
import clsx from "clsx";

interface AutoSizeInput {
	value: string;
	onChange: (value: string) => void;
	onBlur: (value: string) => void;
	placeholder?: string;
	className?: string;
	inputClasses?: string;
}

export const AutoSizeInput = memo<AutoSizeInput>(
	({ value, onChange, onBlur, placeholder = "Untitled", className, inputClasses }) => {
		const handleValueChange = (value: string) => onChange(value);

		return (
			<div className={clsx("autosize-input", className)}>
				<span className="size-span">{value}</span>
				<input
					className={inputClasses}
					value={value}
					onChange={(e) => handleValueChange(e.target.value)}
					placeholder={placeholder}
					autoComplete="off"
					spellCheck="false"
					onBlur={(e) => onBlur(e.target.value)}
				/>
			</div>
		);
	},
);
