import { memo } from "react";

export const Color = memo(function Color() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0h24v24H0z" />
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M11.999 6.375a.272.272 0 00-.273.275.275.275 0 10.273-.275M6.924 11.999a.275.275 0 10-.548.004.275.275 0 00.548-.004M15.977 8.022a.275.275 0 10-.385.39.275.275 0 00.385-.39M8.41 15.589a.275.275 0 10-.385.39.275.275 0 00.385-.39M8.411 8.41a.275.275 0 10-.39-.385.275.275 0 00.39.385"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M12 21a9 9 0 01-8.996-9.255c.13-4.696 4.045-8.611 8.741-8.741A9 9 0 0121 12v1a2 2 0 01-2 2h-2.063a2 2 0 00-1.923 2.549l.257.901A2 2 0 0113.349 21H12z"
				/>
			</g>
		</svg>
	);
});
