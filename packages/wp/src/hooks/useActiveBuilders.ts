import { useEffect } from "react";
import { getActiveBuilders } from "functions/wpdb";
import { useAtom, useSetAtom } from "jotai";
import { activeBuildersAtom, isOxygen6Atom } from "state/activeBuildersAtoms";

const additional = "figma";

export function useActiveBuilders(callback?: (activeBuilders: string[] | undefined) => void) {
	const [activeBuilders, setActiveBuilder] = useAtom(activeBuildersAtom);
	const setIsOxygen6 = useSetAtom(isOxygen6Atom);

	async function fetchActiveBuilders() {
		const result = await getActiveBuilders();
		const builders = result.builders ?? [];
		builders.push(additional);

		callback?.(builders);

		if (result.isOxygen6) {
			setIsOxygen6(true);
		}

		if (!builders.length) {
			return;
		}

		setActiveBuilder(builders);
	}

	useEffect(() => {
		if (activeBuilders === null) {
			fetchActiveBuilders();
		}
	}, []);

	return { activeBuilders };
}
