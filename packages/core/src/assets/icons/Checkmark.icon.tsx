import { memo } from "react";

export const Checkmark = memo(function Checkmark() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12" fill="none" viewBox="0 0 18 12">
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.743 10.49L16.316 1M1 4.796l5.743 5.693"
			/>
		</svg>
	);
});
