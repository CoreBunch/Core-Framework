import { memo } from "react";

export const Desktop = memo(function Desktop() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0h24v24H0z"></path>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M19 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2zM14 17l.5 4M10 17l-.5 4M7.2 21h9.6M21 13.5H3"
				></path>
			</g>
		</svg>
	);
});
