import { memo } from "react";

export const Down = memo(function Down() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0h24v24H0z" />
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M21 7.5l-9 9-9-9"
				/>
			</g>
		</svg>
	);
});
