import { memo } from "react";

export const Download = memo(function Download() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24">
			<g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
				<path strokeMiterlimit="10" d="M12 15.238V3.213" />
				<path strokeLinejoin="round" d="m7.375 10.994l3.966 3.966a.937.937 0 0 0 1.318 0l3.966-3.966" />
				<path
					strokeLinejoin="round"
					d="M2.75 13.85v4.625a2.313 2.313 0 0 0 2.313 2.313h13.874a2.313 2.313 0 0 0 2.313-2.313V13.85"
				/>
			</g>
		</svg>
	);
});

Download.displayName = "Download";
