import { memo } from "react";

export const Lock = memo(function Lock() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<rect
				width="16"
				height="11"
				x="4"
				y="10"
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
				d="M8 10V6.5A3.5 3.5 0 0111.5 3h1A3.5 3.5 0 0116 6.5V10"
			/>
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M9 16L15 16"
			/>
		</svg>
	);
});
