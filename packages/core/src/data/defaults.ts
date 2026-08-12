import {
	DEFAULT_SPACE_ID,
	DEFAULT_SPACING_NAME,
	DEFAULT_TYPOGRAPHY_NAME,
	DEFAULT_TYPO_ID,
} from "../constants/modules";
import { ulid } from "ulid";
import { SpacingData } from "components/modules/spacing";
import { getCssForSingleTypeScale } from "components/modules/spacing/functions/getCssForSingleTypeScale";
import { TypographyData } from "components/modules/typography";

export const DEFAULT_SEARCH = false as const;

export const DEFAULT_SAVE = false as const;

export const DEFAULT_VIEW = "COLOR_SYSTEM" as const;

export const DEFAULT_STYLES: Record<string, CssObject[]> = {
	COLOR_SYSTEM: [],
	TYPOGRAPHY: [],
	SPACING: [],
	LAYOUTS: [],
	DESIGN: [],
	FONTS: [],
	COMPONENTS: [],
	OTHER: [],
};

export const DEFAULT_PREFERENCES: PresetPreferences = {
	root_font_size: 10,
	postcss: true,
	min_screen_width: 320,
	max_screen_width: 1400,
	is_rem: true,
};

export const SPACING_CALCULATOR_INITIAL_STATE: SpacingData = {
	groups: [
		{
			id: DEFAULT_SPACE_ID,
			name: DEFAULT_SPACING_NAME,
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
			namingConvention: "space",
			baseScaleIndex: 5,
			isRem: true,
			mode: "fluid",
			manualSizes: [
				{
					min: 5.24,
					max: 4.95,
					name: "space-4xs",
					css: "clamp(0.52rem, calc(-0.03vw + 0.53rem), 0.49rem)",
					id: "01H6EYBJTQAKTRCK7T688VVF61",
				},
				{
					min: 6.55,
					max: 7,
					name: "space-3xs",
					css: "clamp(0.66rem, calc(0.04vw + 0.64rem), 0.7rem)",
					id: "01H6EYBJTQ9KPS3EAZF2B0YTA2",
				},
				{
					min: 8.19,
					max: 9.9,
					name: "space-2xs",
					css: "clamp(0.82rem, calc(0.16vw + 0.77rem), 0.99rem)",
					id: "01H6EYBJTQFGN675Z8538K8WVT",
				},
				{
					min: 10.24,
					max: 14,
					name: "space-xs",
					css: "clamp(1.02rem, calc(0.35vw + 0.91rem), 1.4rem)",
					id: "01H6EYBJTQ9PYFNSA3NG9YPCXN",
				},
				{
					min: 12.8,
					max: 19.8,
					name: "space-s",
					css: "clamp(1.28rem, calc(0.65vw + 1.07rem), 1.98rem)",
					id: "01H6EYBJTQDTTWKAK09VSTNTJ7",
				},
				{
					min: 16,
					max: 28,
					name: "space-m",
					css: "clamp(1.6rem, calc(1.11vw + 1.24rem), 2.8rem)",
					id: "01H6EYBJTQ8PY1JWGFXH4FMD80",
				},
				{
					min: 20,
					max: 39.59,
					name: "space-l",
					css: "clamp(2rem, calc(1.81vw + 1.42rem), 3.96rem)",
					id: "01H6EYBJTQ95FSPZ26R790ZH9G",
				},
				{
					min: 25,
					max: 55.98,
					name: "space-xl",
					css: "clamp(2.5rem, calc(2.87vw + 1.58rem), 5.6rem)",
					id: "01H6EYBJTQC9D1TQ92B7FFV04W",
				},
				{
					min: 31.25,
					max: 79.16,
					name: "space-2xl",
					css: "clamp(3.13rem, calc(4.44vw + 1.71rem), 7.92rem)",
					id: "01H6EYBJTQPY2F62TD44J01KNM",
				},
				{
					min: 39.06,
					max: 111.93,
					name: "space-3xl",
					css: "clamp(3.91rem, calc(6.75vw + 1.75rem), 11.19rem)",
					id: "01H6EYBJTRQJFPVJDTYGHE0BS5",
				},
				{
					min: 48.83,
					max: 158.27,
					name: "space-4xl",
					css: "clamp(4.88rem, calc(10.13vw + 1.64rem), 15.83rem)",
					id: "01H6EYBJTRFR8R2AE47D4Z2FRH",
				},
			],
		},
	],
	classes: [
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-*",
			property: ["padding"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-left-*",
			property: ["padding-left"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-right-*",
			property: ["padding-right"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-top-*",
			property: ["padding-top"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-bottom-*",
			property: ["padding-bottom"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-horizontal-*",
			property: ["padding-left", "padding-right"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".padding-vertical-*",
			property: ["padding-top", "padding-bottom"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-*",
			property: ["margin"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-left-*",
			property: ["margin-left"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-right-*",
			property: ["margin-right"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-top-*",
			property: ["margin-top"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-bottom-*",
			property: ["margin-bottom"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-horizontal-*",
			property: ["margin-left", "margin-right"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".margin-vertical-*",
			property: ["margin-top", "margin-bottom"],
		},
		{
			id: ulid(),
			tabId: DEFAULT_SPACE_ID,
			name: ".gap-*",
			property: ["gap"],
		},
	],
};

export const STYLESHEETS_INITIAL_STATE = {
	isDisabled: false,
	groups: [
		{
			id: ulid(),
			name: "Custom Styles",
			css: "/* Add your custom CSS here */\n",
			isActive: true,
		},
	],
};

export const TYPOGRAPHY_INITIAL_STATE: TypographyData = {
	groups: [
		{
			id: DEFAULT_TYPO_ID,
			name: DEFAULT_TYPOGRAPHY_NAME,
			min: {
				fontSize: 16,
				scaleRatio: 1.125,
			},
			max: {
				fontSize: 18,
				scaleRatio: 1.333,
			},
			steps: "xs,s,m,l,xl,2xl,3xl,4xl",
			namingConvention: "text",
			baseScaleIndex: 2,
			mode: "fluid",
			manualSizes: [
				{
					min: 12.64,
					max: 10.13,
					name: "text-xs",
					css: "clamp(1.26rem, calc(-0.23vw + 1.34rem), 1.01rem)",
					id: "01H6EYBJTQFVBD542QNZH2V7JZ",
				},
				{
					min: 14.22,
					max: 13.5,
					name: "text-s",
					css: "clamp(1.42rem, calc(-0.07vw + 1.44rem), 1.35rem)",
					id: "01H6EYBJTQZDEJHG8HBWB9DJG1",
				},
				{
					min: 16,
					max: 18,
					name: "text-m",
					css: "clamp(1.6rem, calc(0.19vw + 1.54rem), 1.8rem)",
					id: "01H6EYBJTQE0AQZJV5TGX1TQTQ",
				},
				{
					min: 18,
					max: 23.99,
					name: "text-l",
					css: "clamp(1.8rem, calc(0.55vw + 1.62rem), 2.4rem)",
					id: "01H6EYBJTQV3QP43BSW3CGB24E",
				},
				{
					min: 20.25,
					max: 31.98,
					name: "text-xl",
					css: "clamp(2.02rem, calc(1.09vw + 1.68rem), 3.2rem)",
					id: "01H6EYBJTQT1CXDDN6356YMZBE",
				},
				{
					min: 22.78,
					max: 42.63,
					name: "text-2xl",
					css: "clamp(2.28rem, calc(1.84vw + 1.69rem), 4.26rem)",
					id: "01H6EYBJTQ6CDWAQVHMKR9THNJ",
				},
				{
					min: 25.63,
					max: 56.83,
					name: "text-3xl",
					css: "clamp(2.56rem, calc(2.89vw + 1.64rem), 5.68rem)",
					id: "01H6EYBJTQJES9TKQX5JMEF14P",
				},
				{
					min: 28.83,
					max: 75.76,
					name: "text-4xl",
					css: "clamp(2.88rem, calc(4.35vw + 1.49rem), 7.58rem)",
					id: "01H6EYBJTQJCTAJXM4HHS9BZ4P",
				},
			],
		},
	],
	classes: [
		{
			id: ulid(),
			tabId: DEFAULT_TYPO_ID,
			name: ".text-*",
			property: ["font-size"],
		},
	],
};

export const DEFAULT_MIN_SCREEN_WIDTH = DEFAULT_PREFERENCES.min_screen_width!;

export const DEFAULT_MAX_SCREEN_WIDTH = DEFAULT_PREFERENCES.max_screen_width!;

export const DEFAULT_FONT_SIZE = "font-m";

export const DEFAULT_SPACING_SIZE = "space-m";

export const DEFAULT_MANUAL_FONT_SIZE: WithRequiredProperty<
	TypographyData["groups"][0],
	"manualSizes"
>["manualSizes"][0] = {
	id: "",
	min: 16,
	max: 22,
	name: "font-m",
	css: getCssForSingleTypeScale({
		minFontSize: 16,
		maxFontSize: 22,
		minScreenWidth: DEFAULT_MIN_SCREEN_WIDTH,
		maxScreenWidth: DEFAULT_MAX_SCREEN_WIDTH,
		isRem: DEFAULT_PREFERENCES.is_rem!,
	}),
};

export const DEFAULT_MANUAL_SPACING_SIZE: WithRequiredProperty<
	SpacingData["groups"][0],
	"manualSizes"
>["manualSizes"][0] = {
	id: "",
	min: 10,
	max: 15,
	name: "space-m",
	css: getCssForSingleTypeScale({
		minFontSize: 10,
		maxFontSize: 15,
		minScreenWidth: DEFAULT_MIN_SCREEN_WIDTH,
		maxScreenWidth: DEFAULT_MAX_SCREEN_WIDTH,
		isRem: DEFAULT_PREFERENCES.is_rem!,
	}),
};

export const COLUMN_VARIABLES_GROUP_NAME = "Grid Variables";
export const COLUMN_LAYOUTS_GROUP_NAME = "Grid Layouts";
