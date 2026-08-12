import { TypographyItem } from "../types";
import { ulid } from "ulid";

const NEW_TAB_NAME = "Typography";
const NEW_VAR_NAME = "text";

export const getNewTabValues = (currentTabs: TypographyItem[]) => {
	const untitledCount =
		currentTabs.filter(({ name }) => name.toLowerCase().startsWith(NEW_TAB_NAME.toLowerCase())).length + 1;

	return {
		name: untitledCount ? `${NEW_TAB_NAME} ${untitledCount}` : NEW_TAB_NAME,
		varName: untitledCount ? `${NEW_VAR_NAME}-${untitledCount}` : NEW_VAR_NAME,
	};
};

export const getNewTab = (name: string, varName: string = name.toLowerCase()): TypographyItem => {
	return {
		id: ulid(),
		name: name,
		min: {
			fontSize: 16,
			scaleRatio: 1.125,
		},
		max: {
			fontSize: 18,
			scaleRatio: 1.333,
		},
		steps: "xs,s,m,l,xl,2xl,3xl,4xl",
		namingConvention: varName,
		baseScaleIndex: 2,
		mode: "fluid",
		manualSizes: [
			{
				min: 12.64,
				max: 10.13,
				name: `${varName}-xs`,
				css: "clamp(1.26rem, calc(-0.23vw + 1.34rem), 1.01rem)",
				id: ulid(),
			},
			{
				min: 14.22,
				max: 13.5,
				name: `${varName}-s`,
				css: "clamp(1.42rem, calc(-0.07vw + 1.44rem), 1.35rem)",
				id: ulid(),
			},
			{
				min: 16,
				max: 18,
				name: `${varName}-m`,
				css: "clamp(1.6rem, calc(0.19vw + 1.54rem), 1.8rem)",
				id: ulid(),
			},
			{
				min: 18,
				max: 23.99,
				name: `${varName}-l`,
				css: "clamp(1.8rem, calc(0.55vw + 1.62rem), 2.4rem)",
				id: ulid(),
			},
			{
				min: 20.25,
				max: 31.98,
				name: `${varName}-xl`,
				css: "clamp(2.02rem, calc(1.09vw + 1.68rem), 3.2rem)",
				id: ulid(),
			},
			{
				min: 22.78,
				max: 42.63,
				name: `${varName}-2xl`,
				css: "clamp(2.28rem, calc(1.84vw + 1.69rem), 4.26rem)",
				id: ulid(),
			},
			{
				min: 25.63,
				max: 56.83,
				name: `${varName}-3xl`,
				css: "clamp(2.56rem, calc(2.89vw + 1.64rem), 5.68rem)",
				id: ulid(),
			},
			{
				min: 28.83,
				max: 75.76,
				name: `${varName}-4xl`,
				css: "clamp(2.88rem, calc(4.35vw + 1.49rem), 7.58rem)",
				id: ulid(),
			},
		],
	};
};

export const duplicateTab = (tab: TypographyItem, currentTabs: TypographyItem[]) => {
	const { name, varName } = getNewTabValues(currentTabs);

	const duplicatedTab: TypographyItem = {
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
