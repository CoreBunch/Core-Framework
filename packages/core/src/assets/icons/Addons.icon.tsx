import { memo } from "react";

export const Addons = memo(function Addons() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
				<path d="M5.167 10.498a2.688 2.688 0 00-1.4.091 2.61 2.61 0 00-1.687 1.835 2.644 2.644 0 003.087 3.246v3.22A2.11 2.11 0 007.278 21h11.611A2.11 2.11 0 0021 18.889V7.278a2.11 2.11 0 00-2.111-2.111h-3.22a2.688 2.688 0 00-.091-1.4 2.613 2.613 0 00-1.835-1.687 2.644 2.644 0 00-3.246 3.087h-3.22a2.11 2.11 0 00-2.111 2.111v3.22z" />
				<path d="M13 10.5L13 14.5" />
				<path d="M15 12.5L11 12.5" />
			</g>
			<path fill="none" d="M0 0h24v24H0V0z" />
		</svg>
	);
});

Addons.displayName = "Addons";
