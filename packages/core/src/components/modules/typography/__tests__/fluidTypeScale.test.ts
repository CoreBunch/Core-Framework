import { DEFAULT_TYPOGRAPHY_NAME } from "constants/modules";
import { generateFluidTypographyCss } from "../functions/getFluidTypeVariables";
import { ulid } from "ulid";

const formState = {
	id: ulid(),
	name: DEFAULT_TYPOGRAPHY_NAME,
	min: {
		fontSize: 16,
		scaleRatio: 1.25,
	},
	max: {
		fontSize: 19,
		scaleRatio: 1.25,
	},
	steps: "sm,base,md,lg,xl,xxl,xxxl",
	namingConvention: "font-size",
	baseScaleIndex: 0,
} as const;

const result = `--font-size-sm: clamp(16px, calc(0.34vw + 14.64px), 19px);
--font-size-base: clamp(20px, calc(0.43vw + 18.3px), 23.75px);
--font-size-md: clamp(25px, calc(0.53vw + 22.87px), 29.69px);
--font-size-lg: clamp(31.25px, calc(0.67vw + 28.59px), 37.11px);
--font-size-xl: clamp(39.06px, calc(0.83vw + 35.73px), 46.39px);
--font-size-xxl: clamp(48.83px, calc(1.04vw + 44.67px), 57.98px);
--font-size-xxxl: clamp(61.04px, calc(1.3vw + 55.83px), 72.48px);`;

test("Fluid Type Scale | unit = 'px' | steps = 'sm,base,md,lg,xl,xxl,xxxl'", () => {
	const css = generateFluidTypographyCss({
		typographyData: { groups: [formState] },
		root_font_size: 16,
		is_rem: false,
		min_screen_width: 400,
		max_screen_width: 1280,
	});
	expect(css).toBe(result);
});

const formStateTwo = {
	id: ulid(),
	name: "Card titles",
	min: {
		fontSize: 16,
		scaleRatio: 1.25,
	},
	max: {
		fontSize: 19,
		scaleRatio: 1.25,
	},
	unit: "rem",
	desiredUnit: "rem",
	isRem: true,
	steps: "sm,base,md,lg,xl,xxl,xxxl",
	namingConvention: "font-size",
	baseScaleIndex: 0,
} as const;

const resultTwo = `--font-size-sm: clamp(1rem, calc(0.34vw + 0.92rem), 1.19rem);
--font-size-base: clamp(1.25rem, calc(0.43vw + 1.14rem), 1.48rem);
--font-size-md: clamp(1.56rem, calc(0.53vw + 1.43rem), 1.86rem);
--font-size-lg: clamp(1.95rem, calc(0.67vw + 1.79rem), 2.32rem);
--font-size-xl: clamp(2.44rem, calc(0.83vw + 2.23rem), 2.9rem);
--font-size-xxl: clamp(3.05rem, calc(1.04vw + 2.79rem), 3.62rem);
--font-size-xxxl: clamp(3.81rem, calc(1.3vw + 3.49rem), 4.53rem);`;

test("Fluid Type Scale | unit = 'rem' | steps = 'sm,base,md,lg,xl,xxl,xxxl'", () => {
	const css = generateFluidTypographyCss({
		typographyData: { groups: [formStateTwo] },
		root_font_size: 16,
		is_rem: true,
		min_screen_width: 400,
		max_screen_width: 1280,
	});
	expect(css).toBe(resultTwo);
});

const multipleTypes = [
	{
		id: ulid(),
		name: DEFAULT_TYPOGRAPHY_NAME,
		min: {
			fontSize: 16,
			scaleRatio: 1.25,
		},
		max: {
			fontSize: 19,
			scaleRatio: 1.25,
		},
		steps: "sm,base,md,lg,xl,xxl,xxxl",
		namingConvention: "text",
		baseScaleIndex: 0,
	},
	{
		id: ulid(),
		name: "Cart titles",
		min: {
			fontSize: 16,
			scaleRatio: 1.25,
		},
		max: {
			fontSize: 19,
			scaleRatio: 1.25,
		},
		steps: "sm,base,md,lg,xl,xxl,xxxl",
		namingConvention: "card-description",
		baseScaleIndex: 0,
	},
] as const;

const resultThree = `--text-sm: clamp(1rem, calc(0.34vw + 0.92rem), 1.19rem);
--text-base: clamp(1.25rem, calc(0.43vw + 1.14rem), 1.48rem);
--text-md: clamp(1.56rem, calc(0.53vw + 1.43rem), 1.86rem);
--text-lg: clamp(1.95rem, calc(0.67vw + 1.79rem), 2.32rem);
--text-xl: clamp(2.44rem, calc(0.83vw + 2.23rem), 2.9rem);
--text-xxl: clamp(3.05rem, calc(1.04vw + 2.79rem), 3.62rem);
--text-xxxl: clamp(3.81rem, calc(1.3vw + 3.49rem), 4.53rem);
--card-description-sm: clamp(1rem, calc(0.34vw + 0.92rem), 1.19rem);
--card-description-base: clamp(1.25rem, calc(0.43vw + 1.14rem), 1.48rem);
--card-description-md: clamp(1.56rem, calc(0.53vw + 1.43rem), 1.86rem);
--card-description-lg: clamp(1.95rem, calc(0.67vw + 1.79rem), 2.32rem);
--card-description-xl: clamp(2.44rem, calc(0.83vw + 2.23rem), 2.9rem);
--card-description-xxl: clamp(3.05rem, calc(1.04vw + 2.79rem), 3.62rem);
--card-description-xxxl: clamp(3.81rem, calc(1.3vw + 3.49rem), 4.53rem);`;

test("Multiple Fluid Type Scale | unit = 'rem' | steps = 'sm,base,md,lg,xl,xxl,xxxl'", () => {
	let css = "";

	for (const type of multipleTypes) {
		css += `${generateFluidTypographyCss({
			typographyData: { groups: [type] },
			root_font_size: 16,
			is_rem: true,
			min_screen_width: 400,
			max_screen_width: 1280,
		})}\n`;
	}

	expect(css.trim()).toBe(resultThree);
});
