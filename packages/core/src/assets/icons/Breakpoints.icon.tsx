import { memo } from "react";

export const Breakpoints = memo(function Breakpoints() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0h24v24H0z" />
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M11 18h3M6.469 18.873a.05.05 0 00-.05.05c0 .028.022.05.05.05M19 12V5a2 2 0 00-2-2H6a2 2 0 00-2 2v5M20.5 20h-2.091a1.5 1.5 0 01-1.5-1.5v-5a1.5 1.5 0 011.5-1.5H20.5a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5zM16.91 15H11"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M9 21H4a2 2 0 01-2-2v-7a2 2 0 012-2h5a2 2 0 012 2v7a2 2 0 01-2 2z"
				/>
			</g>
		</svg>
	);
});
