import { memo } from "react";

export const PenEditCircle = memo(function PenEditCircle() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<g fill="none">
				<path d="M0 0H24V24H0z" />
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M5.636 18.364A8.972 8.972 0 0012 21a9 9 0 009-9v0a9 9 0 00-9-9v0a9 9 0 00-9 9"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M11 10L14 13"
				/>
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M6.163 14.837l5.751-5.751a2.122 2.122 0 013 0v0a2.122 2.122 0 010 3l-5.751 5.751c-.168.168-.389.27-.625.29l-2.902.238.238-2.902a.999.999 0 01.289-.626z"
				/>
			</g>
		</svg>
	);
});
