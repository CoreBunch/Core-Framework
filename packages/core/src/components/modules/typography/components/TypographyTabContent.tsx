import { memo, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { ClassSectionHeading } from "components/ClassSectionHeading";
import { Manual } from "../FluidTypographyCalculator.manual";
import { TypeScale } from "../FluidTypographyCalculator.typeScale";
import { TypographyItem } from "../types";
import { SegmentedControl, Switch } from "@mantine/core";
import { useAtom } from "jotai/index";
import { typographyDataAtom } from "state";

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

interface TypographyTabContent {
	readonly typography: TypographyItem | undefined;
	readonly updateTypography: ({ typography, id }: { typography: TypographyItem; id: string }) => void;
}

export const TypographyTabContent = memo<TypographyTabContent>(({ typography, updateTypography }) => {
	const [typographyState, setFluidTypography] = useAtom(typographyDataAtom);
	// Defensive guard: if the parent ever passes `undefined` (e.g. an empty
	// groups array slipped through), avoid crashing on `.id`. The early return
	// must come after all hook calls to respect the Rules of Hooks.
	const activeTab = useMemo(
		() => (typography ? typographyState.groups.find(({ id }) => id === typography.id) : undefined),
		[typographyState, typography?.id],
	);
	const mode = useMemo(() => activeTab?.mode, [activeTab]);

	if (!typography) return null;

	const handleModeChange = (value: string) => {
		setFluidTypography((prev) => {
			const index = prev.groups.findIndex((el) => el.id === typography.id);
			prev.groups[index] = { ...prev.groups[index], mode: value as TypographyItem["mode"] };

			const manualGroups = prev.groups.filter((el) => el.mode === "fluid_manual").map((el) => el.id);
			const manualClasses = prev?.classes?.filter(
				(el) => el.tabId && manualGroups.includes(el.tabId) && !el.isDisabled,
			);
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
							href="https://docs.coreframework.com/navigating-the-ui/typography#info-on-class-generation"
							target="_blank"
						>
							Read why.
						</a>
					</div>
				)}
			</div>

			{[undefined, "fluid"].includes(mode) && activeTab && (
				<TypeScale typography={activeTab} updateTypography={(props) => updateTypography(props)} />
			)}
			{mode === "fluid_manual" && activeTab && (
				<Manual typography={activeTab} updateTypography={(props) => updateTypography(props)} />
			)}
		</div>
	);
});
