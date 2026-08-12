import { ColorSystemFormData } from "./colors/types";
import { SpacingData } from "./spacing/types";

declare module "*.svg" {
	const content: any;
	export default content;
}

export type SimpleVariable = {
	variable: string;
	value: boolean | string | number | RGB | RGBA | VariableAlias;
	type: "BOOLEAN" | "COLOR" | "FLOAT" | "STRING";
	webSyntax?: string;
};

export type SimpleVariable =
	| {
			variable: string;
			value: boolean;
			type: "BOOLEAN";
			webSyntax?: string;
	  }
	| {
			variable: string;
			value: string;
			type: "STRING";
			webSyntax?: string;
	  }
	| {
			variable: string;
			value: number;
			type: "FLOAT";
			webSyntax?: string;
	  }
	| {
			variable: string;
			value: RGB | RGBA;
			type: "COLOR";
			webSyntax?: string;
	  };

export type Declaration = {
	property: string;
	value: string;
	type?: string | undefined;
	fluidValue?: (number | string)[] | undefined;
	colorValue?: string | undefined;
	id: string;
};

export type CssObject = {
	id: string;
	selector: string;
	declarations: Declaration[];
	isDisabled?: boolean | undefined;
	mediaQuery?: number[] | undefined;
	variants?:
		| {
				id: string;
				declarations: Declaration[];
				mediaQuery: number[];
		  }[]
		| undefined;
	media?:
		| "HOVER"
		| "NOT_HOVER"
		| "REDUCED_MOTION"
		| "NOT_REDUCED_MOTION"
		| "LIGHT_MODE"
		| "DARK_MODE"
		| undefined;
	support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
}

export type Group = {
	id: string;
	name: string;
	cssObjects?: CssObject[];
};

export type Preset = {
	id: string;
	name: string;
	app_version?: string | undefined;
	classPrefix?: string | undefined;
	isVariablePrefix?: boolean | undefined;
	variablePrefix?: string | undefined;
	description: string;
	date: string;
	groups?: { [x: string]: Group[] } | undefined;
	breakpoints?: number[][] | undefined;
	styleSheetData?:
		| {
				colorStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: Declaration[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?: { id: string; declarations: Declaration[]; mediaQuery: number[] }[] | undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
				typographyStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: Declaration[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?:
									| {
											id: string;
											declarations: Declaration[];
											mediaQuery: number[];
									  }[]
									| undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
				spacingStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: Declaration[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?: { id: string; declarations: Declaration[]; mediaQuery: number[] }[] | undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
				layoutsStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: {
									property: string;
									value: string;
									type?: string | undefined;
									fluidValue?: (number | string)[] | undefined;
									colorValue?: string | undefined;
									id: string;
								}[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?:
									| {
											id: string;
											declarations: {
												property: string;
												value: string;
												type?: string | undefined;
												fluidValue?: (number | string)[] | undefined;
												colorValue?: string | undefined;
												id: string;
											}[];
											mediaQuery: number[];
									  }[]
									| undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
				designStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: {
									property: string;
									value: string;
									type?: string | undefined;
									fluidValue?: (number | string)[] | undefined;
									colorValue?: string | undefined;
									id: string;
								}[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?:
									| {
											id: string;
											declarations: {
												property: string;
												value: string;
												type?: string | undefined;
												fluidValue?: (number | string)[] | undefined;
												colorValue?: string | undefined;
												id: string;
											}[];
											mediaQuery: number[];
									  }[]
									| undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
				componentsStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: {
									property: string;
									value: string;
									type?: string | undefined;
									fluidValue?: (number | string)[] | undefined;
									colorValue?: string | undefined;
									id: string;
								}[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?:
									| {
											id: string;
											declarations: {
												property: string;
												value: string;
												type?: string | undefined;
												fluidValue?: (number | string)[] | undefined;
												colorValue?: string | undefined;
												id: string;
											}[];
											mediaQuery: number[];
									  }[]
									| undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
				otherStyles?:
					| {
							id: string;
							name: string;
							isDisabled?: boolean | undefined;
							cssObjects: {
								id: string;
								selector: string;
								declarations: {
									property: string;
									value: string;
									type?: string | undefined;
									fluidValue?: (number | string)[] | undefined;
									colorValue?: string | undefined;
									id: string;
								}[];
								isDisabled?: boolean | undefined;
								mediaQuery?: number[] | undefined;
								variants?:
									| {
											id: string;
											declarations: {
												property: string;
												value: string;
												type?: string | undefined;
												fluidValue?: (number | string)[] | undefined;
												colorValue?: string | undefined;
												id: string;
											}[];
											mediaQuery: number[];
									  }[]
									| undefined;
								media?:
									| (
											| "HOVER"
											| "NOT_HOVER"
											| "REDUCED_MOTION"
											| "NOT_REDUCED_MOTION"
											| "LIGHT_MODE"
											| "DARK_MODE"
									  )
									| undefined;
								support?: ("CLAMP" | "NOT_CLAMP" | "ASPECT_RATIO" | "NOT_ASPECT_RATIO") | undefined;
							}[];
							type?: "variable" | undefined;
					  }[]
					| undefined;
		  }
		| undefined;
	modulesData: {
		FLUID_SPACING: SpacingData | undefined;
		FLUID_TYPOGRAPHY: TypographyData | undefined;
		COLOR_SYSTEM: ColorSystemFormData | undefined;
	} | undefined;
	cssString?: string | undefined;
	preferences: {
		root_font_size?: number | undefined;
		postcss?: boolean | undefined;
		postcss_easing_gradients?: boolean | undefined;
		postcss_hover_media?: boolean | undefined;
		min_screen_width?: number | undefined;
		max_screen_width?: number | undefined;
		is_rem?: boolean | undefined;
		prefers_reduced_motion?: boolean | undefined;
		theme_mode?: ("light" | "dark" | "auto") | undefined;
		is_add_group_comments?: boolean | undefined;
	};
};

export type PresetPreferences = Preset["preferences"];

type WithRequiredProperty<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type WithOptionalProperty<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ColorVariable = {
	name: string;
	colorValue: string;
	transparent?: number;
	colorDarkValue?: string;
};
