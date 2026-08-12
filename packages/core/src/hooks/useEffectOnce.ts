import { useEffect, useRef } from "react";

export const useEffectOnce = (callback: () => void, when: unknown = null) => {
	const hasRunOnce = useRef(false);

	useEffect(() => {
		if (!hasRunOnce.current) {
			callback();
			hasRunOnce.current = true;
		}
	}, [callback, when]);
};
