import { memo } from "react";
import { Analysis } from "assets/icons/Analysis.icon";
import { useStats } from "hooks/useStats";

export const Stats = memo(() => {
	const {
		stats: { totalNumberOfVariables, totalNumberOfClasses },
	} = useStats();

	return (
		<div className="stats radius grid relative padding-s text-xs gap-xs">
			<span className="svg-filter-1">
				<Analysis />
			</span>

			<div className="row space-between">
				<span className="opacity-50">Selectors</span>
				<b>{totalNumberOfClasses}</b>
			</div>
			<div className="row space-between">
				<span className="opacity-50">Variables</span>
				<b>{totalNumberOfVariables}</b>
			</div>
		</div>
	);
});

Stats.displayName = "Stats";
