import { SpacingItem } from "../types";
import { ulid } from "ulid";

const NEW_TAB_NAME = "Spacing";
const NEW_VAR_NAME = "space";

export const getNewTabValues = (currentTabs: SpacingItem[]) => {
	const untitledCount =
		currentTabs.filter(({ name }) => name.toLowerCase().startsWith(NEW_TAB_NAME.toLowerCase())).length + 1;

	return {
		name: untitledCount ? `${NEW_TAB_NAME} ${untitledCount}` : NEW_TAB_NAME,
		varName: untitledCount ? `${NEW_VAR_NAME}-${untitledCount}` : NEW_VAR_NAME,
	};
};

export const getNewTab = (name: string, varName: string = name.toLowerCase()): SpacingItem => {
	return {
		id: ulid(),
		name: name,
		min: {
			size: 16,
			scaleRatio: 1.25,
		},
		max: {
			size: 28,
			scaleRatio: 1.414,
			isCustomScaleRatio: false,
			scaleRatioInputValue: 1.333,
		},
		steps: "4xs,3xs,2xs,xs,s,m,l,xl,2xl,3xl,4xl",
		namingConvention: varName,
		baseScaleIndex: 5,
		isRem: true,
		mode: "fluid",
		manualSizes: [
			{
				min: 5.24,
				max: 4.95,
				name: `${varName}-4xs`,
				css: "clamp(0.52rem, calc(-0.03vw + 0.53rem), 0.49rem)",
				id: ulid(),
			},
			{
				min: 6.55,
				max: 7,
				name: `${varName}-3xs`,
				css: "clamp(0.66rem, calc(0.04vw + 0.64rem), 0.7rem)",
				id: ulid(),
			},
			{
				min: 8.19,
				max: 9.9,
				name: `${varName}-2xs`,
				css: "clamp(0.82rem, calc(0.16vw + 0.77rem), 0.99rem)",
				id: ulid(),
			},
			{
				min: 10.24,
				max: 14,
				name: `${varName}-xs`,
				css: "clamp(1.02rem, calc(0.35vw + 0.91rem), 1.4rem)",
				id: ulid(),
			},
			{
				min: 12.8,
				max: 19.8,
				name: `${varName}-s`,
				css: "clamp(1.28rem, calc(0.65vw + 1.07rem), 1.98rem)",
				id: ulid(),
			},
			{
				min: 16,
				max: 28,
				name: `${varName}-m`,
				css: "clamp(1.6rem, calc(1.11vw + 1.24rem), 2.8rem)",
				id: ulid(),
			},
			{
				min: 20,
				max: 39.59,
				name: `${varName}-l`,
				css: "clamp(2rem, calc(1.81vw + 1.42rem), 3.96rem)",
				id: ulid(),
			},
			{
				min: 25,
				max: 55.98,
				name: `${varName}-xl`,
				css: "clamp(2.5rem, calc(2.87vw + 1.58rem), 5.6rem)",
				id: ulid(),
			},
			{
				min: 31.25,
				max: 79.16,
				name: `${varName}-2xl`,
				css: "clamp(3.13rem, calc(4.44vw + 1.71rem), 7.92rem)",
				id: ulid(),
			},
			{
				min: 39.06,
				max: 111.93,
				name: `${varName}-3xl`,
				css: "clamp(3.91rem, calc(6.75vw + 1.75rem), 11.19rem)",
				id: ulid(),
			},
			{
				min: 48.83,
				max: 158.27,
				name: `${varName}-4xl`,
				css: "clamp(4.88rem, calc(10.13vw + 1.64rem), 15.83rem)",
				id: ulid(),
			},
		],
	};
};

export const duplicateTab = (tab: SpacingItem, currentTabs: SpacingItem[]) => {
	const { name, varName } = getNewTabValues(currentTabs);

	const duplicatedTab: SpacingItem = {
		...tab,
		name,
		id: ulid(),
		namingConvention: varName,
		manualSizes:
			tab.manualSizes?.map((size) => {
				return {
					...size,
					id: ulid(),
					name: size.name.replace(tab.namingConvention, varName),
				};
			}) || [],
	};

	return duplicatedTab;
};
