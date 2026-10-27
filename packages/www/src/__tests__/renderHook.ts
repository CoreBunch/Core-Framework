import { Provider, createStore } from "jotai";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

// Minimal renderHook for hooks that read Jotai atoms. The repo has no
// @testing-library/react, and these tests only need the hook's return value.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export function renderHook<T>(useHook: () => T, store = createStore()) {
	const result: { current: T | undefined } = { current: undefined };

	function Probe() {
		result.current = useHook();
		return null;
	}

	const container = document.createElement("div");
	const root = createRoot(container);

	act(() => {
		root.render(createElement(Provider, { store }, createElement(Probe)));
	});

	return {
		result: result as { current: T },
		unmount: () => act(() => root.unmount()),
	};
}
