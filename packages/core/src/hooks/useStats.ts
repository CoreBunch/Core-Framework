import { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { nFormatter } from "utils";
import { globalCssVariablesAtom, joinedStylesAtom } from "state";
import { useDebounce } from "./useDebounce";

interface IStats {
	readonly totalNumberOfClasses: string;
	readonly totalNumberOfVariables: string;
}

const STATS_INITIAL_STATE: IStats = {
	totalNumberOfClasses: "0",
	totalNumberOfVariables: "0",
};

export function useStats() {
	const [stats, setStats] = useState<IStats>(STATS_INITIAL_STATE);

	const getGlobalCssVariables = useAtomCallback(useCallback((get) => get(globalCssVariablesAtom), []));

	const joinedStyles = useAtomValue(joinedStylesAtom);

	const debouncedJoinedStyles = useDebounce(joinedStyles, 300);

	async function regenerateStats() {
		const globalCssVariables = await getGlobalCssVariables();
		const totalNumberOfVariables = nFormatter(Object.values(globalCssVariables).flat().length);
		const totalNumberOfClasses = nFormatter(
			joinedStyles.filter(({ selector, isDisabled }) => selector !== ":root" && !isDisabled).flat().length,
		);

		setStats({
			totalNumberOfClasses,
			totalNumberOfVariables,
		});
	}

	useEffect(() => {
		regenerateStats();
	}, [JSON.stringify(debouncedJoinedStyles)]);

	return { stats, regenerateStats };
}
