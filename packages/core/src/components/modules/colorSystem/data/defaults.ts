import type { ColorItem, ColorSystemFormData } from "../types";
import { extend, random } from "colord";
import harmoniesPlugin from "colord/plugins/harmonies";

try {
	extend([harmoniesPlugin]);
} catch (error) {
	//
}

const DEFAULT_COLOR = random();

export const DEFAULT_SHADES_COUNT = 8;

export const DEFAULT_TINTS_COUNT = 8;

const DEFAULT_COLOR_NAME = "default";

export const DEFAULT_COLOR_ITEM: Omit<ColorItem, "id"> = {
	value: DEFAULT_COLOR?.toHslString(),
	name: DEFAULT_COLOR_NAME,
	format: "hsla",
};

export const COLOR_SYSTEM_INITIAL_STATE: ColorSystemFormData = {
	groups: [
		{
			name: "Brand",
			colors: [
				{
					id: "01GXBWJFMN0FTV5W63KFVZYHHA",
					name: "primary",
					value: "hsla(238, 100%, 62%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: true,
					shades: [
						{
							name: "primary-d-1",
							value: "hsla(240, 56%, 50%, 1)",
						},
						{
							name: "primary-d-2",
							value: "hsla(243, 54%, 37%, 1)",
						},
						{
							name: "primary-d-3",
							value: "hsla(246, 51%, 25%, 1)",
						},
						{
							name: "primary-d-4",
							value: "hsla(250, 43%, 13%, 1)",
						},
					],
					shadesNumber: 4,
					isTints: true,
					tints: [
						{
							name: "primary-l-1",
							value: "hsla(247, 100%, 70%, 1)",
						},
						{
							name: "primary-l-2",
							value: "hsla(251, 100%, 77%, 1)",
						},
						{
							name: "primary-l-3",
							value: "hsla(254, 100%, 85%, 1)",
						},
						{
							name: "primary-l-4",
							value: "hsla(256, 100%, 92%, 1)",
						},
					],
					tintsNumber: 4,
					gen: ["text", "bg", "border"],
				},
				{
					id: "01GXBWJMZX793Y156N940FCB3G",
					name: "secondary",
					value: "hsla(0, 94%, 68%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: true,
					shades: [
						{
							name: "secondary-d-1",
							value: "hsla(1, 50%, 53%, 1)",
						},
						{
							name: "secondary-d-2",
							value: "hsla(1, 42%, 40%, 1)",
						},
						{
							name: "secondary-d-3",
							value: "hsla(2, 40%, 26%, 1)",
						},
						{
							name: "secondary-d-4",
							value: "hsla(4, 35%, 14%, 1)",
						},
					],
					shadesNumber: 4,
					isTints: true,
					tints: [
						{
							name: "secondary-l-1",
							value: "hsla(3, 100%, 75%, 1)",
						},
						{
							name: "secondary-l-2",
							value: "hsla(5, 100%, 81%, 1)",
						},
						{
							name: "secondary-l-3",
							value: "hsla(6, 100%, 87%, 1)",
						},
						{
							name: "secondary-l-4",
							value: "hsla(7, 100%, 93%, 1)",
						},
					],
					tintsNumber: 4,
					gen: ["border", "bg", "text"],
				},
				{
					id: "01H4DWRBRV1RDP8CF36THAMMGK",
					name: "tertiary",
					value: "hsla(198, 74%, 51%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: true,
					shades: [
						{
							name: "tertiary-d-1",
							value: "hsla(199, 63%, 42%, 1)",
						},
						{
							name: "tertiary-d-2",
							value: "hsla(200, 55%, 32%, 1)",
						},
						{
							name: "tertiary-d-3",
							value: "hsla(201, 46%, 22%, 1)",
						},
						{
							name: "tertiary-d-4",
							value: "hsla(203, 35%, 13%, 1)",
						},
					],
					shadesNumber: 4,
					isTints: true,
					tints: [
						{
							name: "tertiary-l-1",
							value: "hsla(202, 71%, 65%, 1)",
						},
						{
							name: "tertiary-l-2",
							value: "hsla(203, 70%, 75%, 1)",
						},
						{
							name: "tertiary-l-3",
							value: "hsla(204, 70%, 84%, 1)",
						},
						{
							name: "tertiary-l-4",
							value: "hsla(205, 70%, 92%, 1)",
						},
					],
					tintsNumber: 4,
					gen: ["text", "bg", "border"],
				},
			],
			id: "01GXBWJFMNRRW8CMRQY1B2BQGG",
		},
		{
			name: "Background",
			colors: [
				{
					id: "01H7SXSF0MT89ZA0Z8BTGTF54C",
					name: "bg-body",
					value: "hsla(0, 0%, 90%, 1)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 5%, 1)",
					format: "hsla",
					shades: [],
					darkShades: [],
					tints: [],
					darkTints: [],
					gen: ["bg"],
				},
				{
					id: "01H7SXTAZRTJ6K45EFMZ2MGAR8",
					name: "bg-surface",
					value: "hsla(0, 0%, 100%, 1)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 15%, 1)",
					format: "hsla",
					shades: [],
					darkShades: [],
					tints: [],
					darkTints: [],
					gen: ["bg"],
				},
			],
			id: "01H7SXSF0M6CW6E204S00ZA61N",
		},
		{
			name: "Text",
			colors: [
				{
					id: "01H7SXV8GB7CBRPWMX4FH73YS2",
					name: "text-body",
					value: "hsla(0, 0%, 25%, 1)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 75%, 1)",
					format: "hsla",
					shades: [],
					darkShades: [],
					tints: [],
					darkTints: [],
					gen: ["text"],
				},
				{
					id: "01H7SXSV7G1CR23F3WSEF02CEE",
					name: "text-title",
					value: "hsla(0, 0%, 0%, 1)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 100%, 1)",
					format: "hsla",
					shades: [],
					darkShades: [],
					tints: [],
					darkTints: [],
					gen: ["text"],
				},
			],
			id: "01H7SXSV7GG9EHNS4ZH046895Y",
		},
		{
			name: "Base",
			colors: [
				{
					id: "01H7XJSG365T8WPY0M8A651XE9",
					name: "border-primary",
					value: "hsla(0, 0%, 50%, 0.25)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 75%, 0.1)",
					format: "hsla",
					shades: [],
					darkShades: [],
					tints: [],
					darkTints: [],
					gen: ["border"],
				},
				{
					id: "01H7XJSTXV32VCY86ZHPGE60MQ",
					name: "shadow-primary",
					value: "hsla(0, 0%, 0%, 0.15)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 0%, 0.4)",
					format: "hsla",
					shades: [],
					darkShades: [],
					tints: [],
					darkTints: [],
				},
			],
			id: "01GXDSXTV182G3Z78KX22K2T5D",
		},
		{
			name: "Neutral",
			colors: [
				{
					id: "01H7XJZ0KTXZ00FKVG3Y345XCP",
					name: "light",
					value: "hsla(85, 0%, 100%, 1)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 0%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: false,
					shades: [],
					darkShades: [],
					shadesNumber: 8,
					tints: [],
					darkTints: [],
					gen: ["bg", "text", "border"],
				},
				{
					id: "01H7XJZ4GBR5DD6Q0547QE5P4H",
					name: "dark",
					value: "hsla(0, 0%, 0%, 1)",
					isDarkMode: true,
					darkValue: "hsla(0, 0%, 100%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: false,
					shades: [],
					darkShades: [],
					shadesNumber: 8,
					isTints: false,
					tints: [],
					darkTints: [],
					tintsNumber: 8,
					gen: ["bg", "text", "border"],
				},
			],
			id: "01H7XJYM4SGDHFEJNT2KV3PWJ5",
		},
		{
			name: "Status",
			colors: [
				{
					id: "01GXK54XWRD73XSRXMZVMQPZY4",
					name: "success",
					value: "hsla(136, 95%, 56%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: false,
					gen: ["text", "bg", "border"],
				},
				{
					id: "01GXK554KKPN6BGJCW08B79T3M",
					name: "error",
					value: "hsla(351, 95%, 56%, 1)",
					format: "hsla",
					transparent: true,
					transparentVariables: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
					isShades: false,
					gen: ["text", "bg", "border"],
				},
			],
			id: "01GXK54XWR1373HKFFPZAVJSW5",
		},
	],
};

export const DEFAULT_OPACITY_VARIANTS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
