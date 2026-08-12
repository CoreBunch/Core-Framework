import { memo, useMemo } from "react";
import { Manual } from "../SpacingCalculator.manual";
import { SpacingScale } from "../SpacingCalculator.spacingScale";
import { SpacingItem } from "../types";
import { SegmentedControl } from "@mantine/core";
import { useAtom } from "jotai/index";
import { spacingDataAtom } from "state";

const SEGMENTED_CONTROL_DATA = [
	{
		label: "Automatic",
		value: "fluid",
	},
	{
		label: "Manual",
		value: "fluid_manual",
	},
] as const;

interface SpacingTabContent {
	readonly space: SpacingItem | undefined;
	readonly updateSpace: ({ space, id }: { space: SpacingItem; id: string }) => void;
}

export const SpacingTabContent = memo<SpacingTabContent>(({ space, updateSpace }) => {
	const [spacingState, setSpacingState] = useAtom(spacingDataAtom);
	// Defensive guard: if the parent ever passes `undefined` (e.g. an empty
	// groups array slipped through), avoid crashing on `.id`. The early return
	// must come after all hook calls to respect the Rules of Hooks.
	// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	const activeTab = useMemo(
		() => (space ? spacingState.groups.find(({ id }) => id === space.id) : undefined),
		[spacingState],
	);
	const mode = useMemo(() => activeTab?.mode, [activeTab]);

	if (!space) return null;

	const handleModeChange = (value: string) => {
		setSpacingState((prev) => {
			const index = prev.groups.findIndex((el) => el.id === space.id);
			prev.groups[index] = { ...prev.groups[index], mode: value as SpacingItem["mode"] };

			const manualGroups = prev.groups.filter((el) => el.mode === "fluid_manual").map((el) => el.id);
			const manualClasses = prev?.classes?.filter((el) => manualGroups.includes(el.tabId) && !el.isDisabled);
			const has_legacy_manual_class_generator = prev.has_legacy_manual_class_generator
				? !!manualClasses?.length
				: false;

			return { ...prev, has_legacy_manual_class_generator, groups: [...prev.groups] };
		});
	};

	return (
		<div className="tab-subsection">
			<div className="mode-selection">
				<SegmentedControl
					onChange={(value) => handleModeChange(value)}
					data={
						SEGMENTED_CONTROL_DATA as unknown as {
							label: string;
							value: string;
						}[]
					}
					value={mode}
				/>

				{mode === "fluid_manual" && (
					<div className="mode-note">
						Note: the manual tab is disabled from the class generators.{" "}
						<a
							href="https://docs.coreframework.com/navigating-the-ui/spacing#info-on-class-generation"
							target="_blank"
						>
							Read why.
						</a>
					</div>
				)}
			</div>

			{[undefined, "fluid"].includes(mode) && activeTab && (
				<SpacingScale space={activeTab} updateSpace={(props) => updateSpace(props)} />
			)}
			{mode === "fluid_manual" && activeTab && (
				<Manual space={activeTab} updateSpace={(props) => updateSpace(props)} />
			)}
		</div>
	);
});
