import { memo, useEffect, useMemo, useReducer, useState } from "react";
import { DEFAULT_MAX_SCREEN_WIDTH, DEFAULT_MIN_SCREEN_WIDTH } from "data/defaults";
import { deepEqual } from "utils/deepEqual";
import { Select } from "@mantine/core";
import { clsx } from "clsx";
import { useAtomValue } from "jotai/index";
import { copyToClipboard } from "utils";
import { Desktop } from "assets/icons/Desktop.icon";
import { Edit } from "assets/icons/Edit.icon";
import { Phone } from "assets/icons/Phone.icon";
import { Plus } from "assets/icons/Plus.icon";
import { NumberInput } from "components/basic/NumberInput";
import { Tooltip } from "components/ui/Tooltip";
import { SPACING_SIZES } from "constants/typeSizes";
import { presetPreferencesSelector } from "state";
import { generateFluidSpacingResult } from "./functions/getFluidSpacingVariables";
import { singleSpacingReducer } from "./hooks/singleSpacingReducer";
import { SpacingItem } from "./types";

interface SpacingCalculatorSpacingScale {
	readonly space: SpacingItem;
	readonly updateSpace: ({ space, id }: { space: SpacingItem; id: string }) => void;
}

export const SpacingScale = memo<SpacingCalculatorSpacingScale>(({ space, updateSpace }) => {
	const { root_font_size, is_rem, max_screen_width, min_screen_width } =
		useAtomValue(presetPreferencesSelector);
	const [copy, setCopy] = useReducer(singleSpacingReducer, space);

	const [copyConfirmation, setCopyConfirmation] = useState(false);

	const spaceScale = useMemo(() => copy, [copy]);
	const result = useMemo(() => {
		return generateFluidSpacingResult({
			spacingState: { groups: [copy] },
			root_font_size: root_font_size || 16,
			is_rem: Boolean(is_rem),
			max_screen_width: max_screen_width || DEFAULT_MAX_SCREEN_WIDTH,
			min_screen_width: min_screen_width || DEFAULT_MIN_SCREEN_WIDTH,
		});
	}, [copy, is_rem, max_screen_width, min_screen_width, root_font_size]);

	const handleMinFontChange = (value: number | string) => setCopy({ type: "minSize", payload: value });
	const handleMaxFontChange = (value: number | string) => setCopy({ type: "maxSize", payload: value });
	const addStepBefore = () => setCopy({ type: "addStepBefore" });
	const addStepAfter = () => setCopy({ type: "addStepAfter" });
	const handleMinScaleRatioChange = (value: string) =>
		setCopy({ type: "minScaleRatio", payload: Number(value) });
	const handleMaxScaleRatioChange = (value: string) =>
		setCopy({ type: "maxScaleRatio", payload: Number(value) });
	const removeStepBefore = () => {
		if (spaceScale.steps.split(",").length === 1) return;
		setCopy({ type: "removeStepBefore" });
	};
	const removeStepAfter = () => {
		if (spaceScale.steps.split(",").length === 1) return;
		setCopy({ type: "removeStepAfter" });
	};

	useEffect(() => {
		if (!deepEqual(space, spaceScale)) {
			setCopy({ type: "updateFormData", payload: { ...spaceScale } });
			updateSpace({ id: spaceScale.id, space: spaceScale });
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [spaceScale]);

	useEffect(() => {
		if (copy.name !== space.name) {
			setCopy({ type: "updateFormData", payload: { ...spaceScale, name: space.name } });
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: aligned with wp version
	}, [space.name]);

	const BASE_SCALE_INDEX_OPTIONS = useMemo(() => {
		const steps = spaceScale.steps.split(",");
		return steps.map((_, i) => ({
			label: steps[i],
			value: String(i),
		}));
	}, [spaceScale.steps]);

	return (
		<div className="grid gap-xl calculator-columns">
			<div className="grid bg-overlay-1 radius border-primary shadow-s">
				<span className="padding-m text-m bg-overlay-1 border-bottom-primary">Base Settings</span>

				<div className="grid gap-m padding-m border-bottom-primary">
					<div className="grid gap-xs">
						<label htmlFor="namingConvention" className="pointer">
							Naming Convention
						</label>
						<input
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							name="namingConvention"
							id="namingConvention"
							value={spaceScale.namingConvention}
							onChange={(e) =>
								setCopy({
									type: "namingConvention",
									payload: e.target.value,
								})
							}
						/>
					</div>
				</div>

				<div className="grid gap-m padding-m border-bottom-primary">
					<div className="grid gap-xs">
						<label htmlFor="min-size" className="pointer">
							Min Size
						</label>
						<NumberInput
							id="min-size"
							onChange={handleMinFontChange}
							value={spaceScale.min.size}
							allowMouseWheel
							unit="px"
							min={0}
							max={Number(spaceScale.max.size)}
							step={0.1}
						/>
					</div>

					<div className="grid gap-xs">
						<div className="row gap-xs space-between">
							<label htmlFor="min-scale-ratio" className="pointer">
								Min Scale Ratio
							</label>

							<Tooltip label="Toggle input">
								<button
									onClick={() =>
										setCopy({
											type: "toggleIsCustomMinScaleRatio",
										})
									}
								>
									<Edit />
								</button>
							</Tooltip>
						</div>

						{spaceScale.min?.isCustomScaleRatio ? (
							<NumberInput
								id="min-scale-ratio"
								onChange={(value) =>
									setCopy({
										type: "minScaleRatioInputValue",
										payload: Number(value),
									})
								}
								value={spaceScale.min.scaleRatioInputValue ?? 1}
								min={1}
								max={5}
								step={0.01}
								precision={8}
								allowMouseWheel
							/>
						) : (
							<Select
								id="min-scale-ratio"
								placeholder="All breakpoints"
								data={SPACING_SIZES}
								onChange={handleMinScaleRatioChange}
								value={String(spaceScale.min.scaleRatio)}
								transitionProps={{
									duration: 150,
									transition: "fade",
								}}
							/>
						)}
					</div>
				</div>

				<div className="grid gap-m padding-m border-bottom-primary">
					<div className="grid gap-xs">
						<label htmlFor="max-size" className="pointer">
							Max Size
						</label>
						<NumberInput
							id="max-size"
							onChange={handleMaxFontChange}
							value={spaceScale.max.size}
							allowMouseWheel
							unit="px"
							min={Number(spaceScale.min.size)}
							max={100}
							step={0.1}
						/>
					</div>

					<div className="grid gap-xs">
						<div className="row gap-xs space-between">
							<label htmlFor="max-scale-ratio" className="pointer">
								Max Scale Ratio
							</label>

							<Tooltip label="Toggle input">
								<button
									onClick={() =>
										setCopy({
											type: "toggleIsCustomMaxScaleRatio",
										})
									}
								>
									<Edit />
								</button>
							</Tooltip>
						</div>

						{spaceScale.max?.isCustomScaleRatio ? (
							<NumberInput
								id="max-scale-ratio"
								onChange={(value) =>
									setCopy({
										type: "maxScaleRatioInputValue",
										payload: Number(value),
									})
								}
								value={spaceScale.max.scaleRatioInputValue ?? 1}
								min={1}
								max={5}
								step={0.01}
								precision={8}
								allowMouseWheel
							/>
						) : (
							<Select
								id="max-scale-ratio"
								placeholder="All breakpoints"
								data={SPACING_SIZES}
								onChange={handleMaxScaleRatioChange}
								value={String(spaceScale.max.scaleRatio)}
								transitionProps={{
									duration: 150,
									transition: "fade",
								}}
							/>
						)}
					</div>
				</div>

				<div className="grid gap-m padding-m">
					<div className="grid gap-xs">
						<label htmlFor="base-scale-index" className="pointer">
							Base Scale Index
						</label>
						<Select
							onChange={(value) =>
								setCopy({
									type: "baseScaleIndex",
									payload: Number(value),
								})
							}
							id="base-scale-index"
							value={String(spaceScale.baseScaleIndex)}
							data={BASE_SCALE_INDEX_OPTIONS}
							transitionProps={{
								duration: 150,
								transition: "fade",
							}}
						/>
					</div>
				</div>
			</div>

			<div className="grid gap-s">
				<ul className="grid border-primary radius relative">
					<button onClick={addStepBefore} className="add-remove add-previous">
						<Plus />
					</button>

					<button onClick={removeStepBefore} className="add-remove remove-previous">
						-
					</button>

					{result?.declarations.length &&
						result.declarations.map((declaration, index) => (
							<li
								key={`${result.typeScales[index].min}${index}`}
								className={clsx("class-row typo-layout", {
									selected: index === spaceScale.baseScaleIndex,
								})}
							>
								<Tooltip
									label={copyConfirmation ? "Copied!" : "Copy"}
									style={{
										backgroundColor: copyConfirmation ? "green" : "",
									}}
								>
									<span
										className="opacity-60 text-l copy"
										onClick={() => {
											copyToClipboard(`var(${Object.keys(declaration)[0]})`);
											setCopyConfirmation(true);

											setTimeout(() => setCopyConfirmation(false), 1000);
										}}
									>
										{Object.keys(declaration)[0]}
									</span>
								</Tooltip>

								<div className="calculator-preview">
									<div className="calculator-preview-single">
										<span>
											{result.typeScales[index].min}
											px
										</span>

										<div className="row gap-s">
											<Phone />

											<div
												className="spacing-preview"
												style={{
													width: `${result.typeScales[index].min}px`,
												}}
											/>
										</div>
									</div>

									<div className="calculator-preview-single">
										<span>
											{Number(result.typeScales[index].max) < Number(result.typeScales[index].min)
												? result.typeScales[index].min
												: result.typeScales[index].max}
											px
										</span>

										<div className="row gap-s">
											<Desktop />

											<div
												className="spacing-preview"
												style={{
													width: `${
														Number(result.typeScales[index].max) < Number(result.typeScales[index].min)
															? result.typeScales[index].min
															: result.typeScales[index].max
													}px`,
												}}
											/>
										</div>
									</div>
								</div>
							</li>
						))}

					<button className="add-remove add-next" onClick={addStepAfter}>
						<Plus />
					</button>

					<button onClick={removeStepAfter} className="add-remove remove-next">
						-
					</button>
				</ul>
			</div>
		</div>
	);
});

SpacingScale.displayName = "TypeScale";
