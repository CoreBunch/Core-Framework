import { memo } from "react";

export const Duplicate = memo(function Duplicate() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<rect
				width="14"
				height="14"
				x="3"
				y="7"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				rx="3"
			/>
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M20 16a2.98 2.98 0 001-2.221V6a3 3 0 00-3-3h-7.779A2.98 2.98 0 008 4"
			/>
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M10 16.5L10 11.5"
			/>
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M7.5 14L12.5 14"
			/>
		</svg>
	);
});
