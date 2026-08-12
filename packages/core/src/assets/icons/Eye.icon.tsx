import { memo } from "react";

export const Eye = memo(function Eye() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0h24v24H0z"></path>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M3.118 12.467a.987.987 0 010-.935C5.01 8.033 8.505 5 12 5s6.99 3.033 8.882 6.533a.987.987 0 010 .935C18.99 15.967 15.495 19 12 19s-6.99-3.033-8.882-6.533z"
				></path>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.429"
					d="M14.121 9.879A3 3 0 119.88 14.12 3 3 0 0114.12 9.88"
				></path>
			</g>
		</svg>
	);
});
