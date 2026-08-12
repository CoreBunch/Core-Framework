import { memo } from "react";

export const Cross = memo(function Cross() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 13 13">
			<path fill="currentColor" d="M1.743 11.49L11.316 2l-9.573 9.49z" />
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M1.743 11.49L11.316 2"
			/>
			<path fill="currentColor" d="M1.785 1.958l9.49 9.573-9.49-9.573z" />
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M1.785 1.958l9.49 9.573"
			/>
		</svg>
	);
});
