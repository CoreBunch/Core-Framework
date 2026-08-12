import { memo } from "react";

export const Code = memo(function Code() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0h24v24H0z"></path>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M13.78 4l-3.56 16M18 8l4 4-4 4M6 16l-4-4 4-4"
				></path>
			</g>
		</svg>
	);
});

Code.displayName = "Code";
