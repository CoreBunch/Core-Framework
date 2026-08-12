import { useEffect, useRef } from "react";

export function useDidMountEffect(fn: () => void, deps: unknown[]) {
	const didMount = useRef(false);

	useEffect(() => {
		if (didMount.current) fn();
		else didMount.current = true;
	}, deps);
}
