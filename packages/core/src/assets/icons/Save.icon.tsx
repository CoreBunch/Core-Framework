import { memo } from "react";

export const Save = memo(function Save() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M3.879 5.121L5.12 3.88A3 3 0 017.243 3H18a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V7.243a3 3 0 01.879-2.122z"
			/>
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M16 3v4a1 1 0 01-1 1H9a1 1 0 01-1-1V3"
			/>
			<circle
				cx="12"
				cy="14.5"
				r="3"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			/>
			<path fill="none" d="M24 24V0H0v24z" />
		</svg>
	);
});
