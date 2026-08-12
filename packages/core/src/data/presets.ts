import { ulid } from "ulid";
import { COLOR_SYSTEM_INITIAL_STATE } from "components/modules/colorSystem";
import { COMPONENTS_INITIAL_STATE } from "components/modules/components";
import { APP_VERSION } from "constants/version";
import {
	COLUMN_LAYOUTS_GROUP_NAME,
	COLUMN_VARIABLES_GROUP_NAME,
	DEFAULT_PREFERENCES,
	SPACING_CALCULATOR_INITIAL_STATE,
	TYPOGRAPHY_INITIAL_STATE,
} from "./defaults";

const BLANK_PRESET_SCAFFOLD: {
	styleSheetData: Preset["styleSheetData"];
	modulesData: Preset["modulesData"];
} = {
	styleSheetData: {
		colorStyles: [],
		typographyStyles: [],
		spacingStyles: [],
		layoutsStyles: [],
		designStyles: [],
		componentsStyles: [],
		fontsStyles: [],
		otherStyles: [],
	},
	modulesData: {
		FLUID_TYPOGRAPHY: {
			groups: [],
		},
		COLOR_SYSTEM: {
			groups: [],
		},
		FLUID_SPACING: {
			groups: [],
		},
		COMPONENTS: {
			components: [],
		},
		FONTS: {
			fonts: [],
		},
	},
};

export const clearPresetData = (preset: Preset): Preset => ({
	...preset,
	...BLANK_PRESET_SCAFFOLD,
});

export const DEFAULT_PRESET: Preset = {
	id: ulid(),
	name: "Default Core Framework Project",
	description: "",
	date: "2023-05-16T06:39:10.200Z",
	app_version: `${APP_VERSION}_default`,
	preferences: DEFAULT_PREFERENCES,
	breakpoints: [
		[0, 1400],
		[0, 992],
		[0, 768],
		[0, 480],
	],
	styleSheetData: {
		colorStyles: [],
		typographyStyles: [
			{
				id: "01GXDT3208JBNT6XESNSE76324",
				name: "Contextual variables",
				type: "variable",
				cssObjects: [
					{
						id: "01GXDT320FNMKNGMYC90312321",
						selector: ":root",
						declarations: [
							{
								id: "01GXDT320FC0HV9WQ2VJYA067543",
								property: "--hero-title-size",
								value: "var(--text-4xl)",
							},
							{
								id: "01GXDT320F345435Q2VJYA067543",
								property: "--post-title-size",
								value: "var(--text-2xl)",
							},
							{
								id: "01GXDT320F0989088VJYA067543",
								property: "--nav-link-size",
								value: "var(--text-s)",
							},
						],
					},
				],
			},
			{
				id: "0",
				name: "Headings",
				cssObjects: [
					{
						id: "01GTC7DFAEAM2TP6NCJTP7EKKC",
						selector: "H1",
						declarations: [
							{
								property: "font-size",
								value: "var(--text-4xl)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7DFAE20E2JMH5GNM2SMJH",
							},
							{
								property: "line-height",
								value: "1.1",
								fluidValue: [0, 0, "px"],
								id: "01GXK6J397XDM8WGREHQE51BTF",
							},
						],
					},
					{
						id: "01GTC7F3N0QBBYV4GCJCDAWG4S",
						selector: "H2",
						declarations: [
							{
								property: "font-size",
								value: "var(--text-3xl)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7F3N0WR1WAYT8T731B0XK",
							},
							{
								property: "line-height",
								value: "1.2",
								fluidValue: [0, 0, "px"],
								id: "01GXW33S22N99G5479ZF3D3P7W",
							},
						],
					},
					{
						id: "01GTC7F5B5KVGK01CS9B831SGB",
						selector: "H3",
						declarations: [
							{
								property: "font-size",
								value: "var(--text-2xl)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7F5B511HWPPM01R7464EQ",
							},
							{
								property: "line-height",
								value: "1.3",
								fluidValue: [0, 0, "px"],
								id: "01GXW343XDAH48K1SAT089DKTT",
							},
						],
					},
					{
						id: "01GTC7F6ACFHV9XBQA2WRKQ8X5",
						selector: "H4",
						declarations: [
							{
								property: "font-size",
								value: "var(--text-xl)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7F6ACTGB8WAQPN4XHC53G",
							},
							{
								property: "line-height",
								value: "1.3",
								fluidValue: [0, 0, "px"],
								id: "01GXW34KJKC0Z0VQHHFW9MVB79",
							},
						],
					},
					{
						id: "01GTC7F70NEMF3RTDRK3BT64YV",
						selector: "H5",
						declarations: [
							{
								property: "font-size",
								value: "var(--text-l)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7F70N5V5Y1RB2F3FEESG6",
							},
							{
								property: "line-height",
								value: "1.3",
								fluidValue: [0, 0, "px"],
								id: "01GXW34T9MN54TVN32FSK5DP84",
							},
						],
					},
					{
						id: "01GTC7F7YVD97B67VSSK7K8S51",
						selector: "H6",
						declarations: [
							{
								property: "font-size",
								value: "var(--text-m)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7F7YVC25M34JRSJM8GAWA",
							},
							{
								property: "line-height",
								value: "1.4",
								fluidValue: [0, 0, "px"],
								id: "01GXW350VH0ECCWV1TKNRAKNDS",
							},
						],
					},
				],
			},
			{
				id: "01GXKD3G35ARW26A0G6EVYSAR9",
				name: "Line heights",
				cssObjects: [
					{
						id: "01GXKD3G3A88SWDANFW6ES3XF9",
						selector: ".line-height-xs",
						declarations: [
							{
								property: "line-height",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GXKD3G3AZVEKNBBWMXTVH59G",
							},
						],
					},
					{
						id: "01GXKD3WVNBM6TMTQTAVMCK0YE",
						selector: ".line-height-s",
						declarations: [
							{
								property: "line-height",
								value: "1.2",
								fluidValue: [0, 0, "px"],
								id: "01GXKD3G3AZVEKNBBWMXTVH59G",
							},
						],
					},
					{
						id: "01GXKD42ZTMQE27XMWYK3Y54YG",
						selector: ".line-height-m",
						declarations: [
							{
								property: "line-height",
								value: "1.3",
								fluidValue: [0, 0, "px"],
								id: "01GXKD3G3AZVEKNBBWMXTVH59G",
							},
						],
					},
					{
						id: "01GXW281S812F130EF14PZQH5T",
						selector: ".line-height-l",
						declarations: [
							{
								property: "line-height",
								value: "1.4",
								fluidValue: [0, 0, "px"],
								id: "01GXKD3G3AZVEKNBBWMXTVH59G",
							},
						],
					},
					{
						id: "01GXW286R2NNA3M8DHJJ82Y4MQ",
						selector: ".line-height-xl",
						declarations: [
							{
								property: "line-height",
								value: "1.5",
								fluidValue: [0, 0, "px"],
								id: "01GXKD3G3AZVEKNBBWMXTVH59G",
							},
						],
					},
				],
			},
			{
				id: "1",
				name: "Text Modifiers",
				cssObjects: [
					{
						id: "01GXW35HAQ92NMEG69YP4YC5MV",
						selector: ".italic",
						declarations: [
							{
								property: "font-style",
								value: "italic",
								fluidValue: [0, 0, "px"],
								id: "01GTC7JNS21M04S04HPDHGKTHD",
							},
						],
					},
					{
						id: "01H5YTK2FBN5MMN289XVEP9SY4",
						selector: ".bold",
						declarations: [
							{
								property: "font-weight",
								value: "bold",
								fluidValue: [0, 0, "px"],
								id: "01GTC7JNS21M04S04HPDHGKTHD",
							},
						],
					},
					{
						id: "01GTC7HQ4VWMJ49C0DYBJ5DJT4",
						selector: ".lowercase",
						declarations: [
							{
								property: "text-transform",
								value: "lowercase",
								fluidValue: [0, 0, "px"],
								id: "01GTC7HQ4VJ67XVC59RKSQQVST",
							},
						],
					},
					{
						id: "01GTC7H9W587YDR40R37G13NA2",
						selector: ".uppercase",
						declarations: [
							{
								property: "text-transform",
								value: "uppercase",
								fluidValue: [0, 0, "px"],
								id: "01GTC7H9W50FV0RED74KDEP13R",
							},
						],
					},
					{
						id: "01GTC7J82M80AD34G3TQXYHDSC",
						selector: ".underline",
						declarations: [
							{
								property: "text-decoration",
								value: "underline",
								fluidValue: [0, 0, "px"],
								id: "01GTC7J82M9TM6MGQ0BHZR54QA",
							},
						],
					},
					{
						id: "01GTC9FR7YAP8TT6EMPE2J6RCV",
						selector: ".font-100",
						declarations: [
							{
								property: "font-weight",
								value: "100",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5E3KT0BFJ65QKD9898DB1",
						selector: ".font-200",
						declarations: [
							{
								property: "font-weight",
								value: "200",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5E5FZ2EVJ7W4BTMFDNQR2",
						selector: ".font-300",
						declarations: [
							{
								property: "font-weight",
								value: "300",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5E7ENG84XA3WSJ0S0F4B7",
						selector: ".font-400",
						declarations: [
							{
								property: "font-weight",
								value: "400",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5EG1K33Y2S4SQFPPWQC74",
						selector: ".font-500",
						declarations: [
							{
								property: "font-weight",
								value: "500",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5EKSYVSSFPPK5T03ZA2S8",
						selector: ".font-600",
						declarations: [
							{
								property: "font-weight",
								value: "600",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5F0G1EEMZD0CAYHGM7D6N",
						selector: ".font-700",
						declarations: [
							{
								property: "font-weight",
								value: "700",
								fluidValue: [0, 0, "px"],
								id: "01GTC9FR7YB19JWW0R24JZCYT4",
							},
						],
					},
					{
						id: "01GWM5EE31KTCNEYNA637R094W",
						selector: ".font-800",
						declarations: [
							{
								property: "font-weight",
								value: "800",
								fluidValue: [0, 0, "px"],
								id: "01GWM5EE319C9E7ZS6GBV3M6BK",
							},
						],
					},
					{
						id: "01GWM5FHQGZQ6QR19146M7V5J1",
						selector: ".font-900",
						declarations: [
							{
								property: "font-weight",
								value: "900",
								fluidValue: [0, 0, "px"],
								id: "01GWM5EE319C9E7ZS6GBV3M6BK",
							},
						],
					},
				],
			},
			{
				id: "01GXDT3208JBNT6XESNSEMYE81",
				name: "Text Alignment",
				cssObjects: [
					{
						id: "01GXDT320FNMKNGMYC903E350P",
						selector: ".text-left",
						declarations: [
							{
								property: "text-align",
								value: "left",
								fluidValue: [0, 0, "px"],
								id: "01GXDT320FC0HV9WQ2VJYA0NEM",
							},
						],
					},
					{
						id: "01GXVF05JH36YR3VZHF64YZYWK",
						selector: ".text-center",
						declarations: [
							{
								property: "text-align",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GXDT320FC0HV9WQ2VJYA0NEM",
							},
						],
					},
					{
						id: "01GXVF06PP0TR5XPZF9P5RJFQ7",
						selector: ".text-right",
						declarations: [
							{
								property: "text-align",
								value: "right",
								fluidValue: [0, 0, "px"],
								id: "01GXDT320FC0HV9WQ2VJYA0NEM",
							},
						],
					},
				],
			},
		],
		spacingStyles: [
			{
				id: "01GXDT3208JBNT6JGHJGHJGRYT",
				name: "Contextual variables",
				type: "variable",
				cssObjects: [
					{
						id: "0UKJGHG67577KNGMYC90312321",
						selector: ":root",
						declarations: [
							{
								id: "TIUIUY0FC0HV9WQ2VJYA067543",
								property: "--header-space",
								value: "var(--space-s)",
							},
							{
								id: "BMFHKJ320F345435Q2VJYA067543",
								property: "--btn-space",
								value: "var(--space-xs) var(--space-s)",
							},
							{
								id: "OIUASDS32989088VJYA067543",
								property: "--card-space",
								value: "var(--space-s)",
							},
							{
								id: "OIUASDS329SYDUTSUYTYA067543",
								property: "--footer-space",
								value: "var(--space-s) var(--space-m)",
							},
						],
					},
				],
			},
		],
		layoutsStyles: [
			{
				id: "01GXDTHGJHGGHGUYHJT6XESNSE76324",
				name: COLUMN_VARIABLES_GROUP_NAME,
				type: "variable",
				cssObjects: [
					{
						id: "01GXDTHGJ84567JJGJHJT6XESNSE76324",
						selector: ":root",
						declarations: [
							{
								id: "01GXDTH123242GJHJT6XESNSE76324",
								property: "--columns-1",
								value: "repeat(1, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH1232423GJHJT6XESNSE76324",
								property: "--columns-2",
								value: "repeat(2, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH123242GJHJT6XESNSE76324",
								property: "--columns-3",
								value: "repeat(3, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH1232424GJHJT6XESNSE76324",
								property: "--columns-4",
								value: "repeat(4, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH1232425GJHJT6XESNSE76324",
								property: "--columns-5",
								value: "repeat(5, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH1232426GJHJT6XESNSE76324",
								property: "--columns-6",
								value: "repeat(6, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH1232427GJHJT6XESNSE76324",
								property: "--columns-7",
								value: "repeat(7, minmax(0, 1fr))",
							},
							{
								id: "01GXDTH1232428GJHJT6XESNSE76324",
								property: "--columns-8",
								value: "repeat(8, minmax(0, 1fr))",
							},
						],
					},
				],
			},
			{
				id: "3",
				name: COLUMN_LAYOUTS_GROUP_NAME,
				cssObjects: [
					{
						id: "01H03GA0VQX8WVYVV9HDMKVNVB",
						selector: ".row",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AYWGWF25V04EE0TY0H8TX0",
							},
							{
								property: "grid-auto-flow",
								value: "column",
								fluidValue: [0, 0, "px"],
								id: "01GTC7N9XS1WAZYK990GPD4T5E",
							},
							{
								property: "justify-content",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01H2APN0G6EMFE9AVXX9QFW7TP",
							},
						],
					},
					{
						id: "01GTC7MWW8P3REHYET9H3NND3S",
						selector: ".column",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AYZ8HPN608G22VRJQPRDKX",
							},
							{
								property: "grid-auto-flow",
								value: "row",
								fluidValue: [0, 0, "px"],
								id: "01GTC7MWW89H49087EY5Q6XEG7",
							},
							{
								property: "justify-items",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01H2D8HQG1M2W1R9AKATD0TS6P",
							},
							{
								property: "align-content",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01H2D8JBR9D46K4MN1G2K0M5GN",
							},
						],
					},
					{
						id: "01GXVVW5TG89DNJBWK6G8GQ6J8",
						selector: ".columns-2",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AYZGMQP3J2VKQDWRG4CZNY",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-2)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7N9XS1WAZYK990GPD4T5E",
							},
						],
					},
					{
						id: "01GTC7NJ9S0N1G7BXQ16KY3CN0",
						selector: ".columns-3",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AYZQQJDZT24VQQHM8Y0E5R",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-3)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7NVCYQX75XQXP1KY68STJ",
							},
						],
					},
					{
						id: "01GTC7P0ZVMAYDKXJR6F35CJH4",
						selector: ".columns-4",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AYZZ8JEGQ5N9PBCY4KD8SE",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-4)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7P8RRRHT6EPE2Q2FYEACJ",
							},
						],
					},
					{
						id: "01GTC7PKC8HJSTGMJYK1JWA4MW",
						selector: ".columns-5",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AZ075SM5J2JMZRRVYMSBFW",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-5)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7PV6C5GMRMVEG1T20Q2TD",
							},
						],
					},
					{
						id: "01GTC7Q1D3PEPMJ463EV2ZZK3H",
						selector: ".columns-6",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AZ0ETKEMW9P5EDFS1VE0JK",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-6)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7Q7QWKGVX8AAE20GP57QQ",
							},
						],
					},
					{
						id: "01H2D7Z91C904XG5XXATC6Z1RT",
						selector: ".columns-7",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AZ0ETKEMW9P5EDFS1VE0JK",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-7)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7Q7QWKGVX8AAE20GP57QQ",
							},
						],
					},
					{
						id: "01H2D7ZP09RB6YQ7AVPN8JVVJT",
						selector: ".columns-8",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H2AZ0ETKEMW9P5EDFS1VE0JK",
							},
							{
								property: "grid-template-columns",
								value: "var(--columns-8)",
								fluidValue: [0, 0, "px"],
								id: "01GTC7Q7QWKGVX8AAE20GP57QQ",
							},
						],
					},
					{
						id: "01GWSFW6Q76ABBA9MTNTR9M5T8",
						selector: ".column--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "1fr",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
							{
								property: "grid-auto-flow",
								value: "row",
								fluidValue: [0, 0, "px"],
								id: "01H4DV3N7S9DS9HXVQ5WTQ83H8",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01H4DV3V1D85BSM5VYD0NQAFGZ",
						selector: ".row--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "unset",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
							{
								property: "grid-auto-flow",
								value: "column",
								fluidValue: [0, 0, "px"],
								id: "01H4DV3N7S9DS9HXVQ5WTQ83H8",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSFWP6YT6AJF8NW15ZCR3BF",
						selector: ".columns-2--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(2, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSFWQSD83SWYFKMW4GN540B",
						selector: ".columns-3--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(3, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSFWRXA87SWTXFF7EW9G9PE",
						selector: ".columns-4--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(4, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSFWSYQPYG6GNDPBPT9DN3S",
						selector: ".columns-5--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(5, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSFWVBB21DDMC8G9ZAMRNKF",
						selector: ".columns-6--on-xl",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(6, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSFW6Q7ZZCJEEP9C0FQ0RFB",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG7V2CC1F1JFM50RRH9YNH",
						selector: ".column--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "1fr",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
							{
								property: "grid-auto-flow",
								value: "row",
								fluidValue: [0, 0, "px"],
								id: "01H4DV1BDWED0ETW9DJMF11XG6",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01H4DV2FWR7NC3TR9JCY3H6B38",
						selector: ".row--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "unset",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
							{
								property: "grid-auto-flow",
								value: "column",
								fluidValue: [0, 0, "px"],
								id: "01H4DV1BDWED0ETW9DJMF11XG6",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG8DY4JJ06V741863ZQGVB",
						selector: ".columns-2--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(2, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG8FFPR7TV13WQFYVA3VW4",
						selector: ".columns-3--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(3, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG8GTETSTJ7M9CH2YWKFXT",
						selector: ".columns-4--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(4, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG8HYDGKA8D3E71Z7SXWXP",
						selector: ".columns-5--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(5, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG8R24FZ962CDBYPG8AH4W",
						selector: ".columns-6--on-l",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(6, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSG7V2CQ7190VMHW036J228",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGFS115DVGN09WFTM5MN57",
						selector: ".column--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "1fr",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
							{
								property: "grid-auto-flow",
								value: "row",
								fluidValue: [0, 0, "px"],
								id: "01H4DV4SY19ND0E6EPKQ2JPV84",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01H4DV4NN6SB8QH69N2XG8HE30",
						selector: ".row--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "unset",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
							{
								property: "grid-auto-flow",
								value: "column",
								fluidValue: [0, 0, "px"],
								id: "01H4DV4X2K661WFJJ191VAA4GX",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGG5YMNP37E37W4KMTSTDE",
						selector: ".columns-2--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(2, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGG7B4H0AQ5QV9T3G62EC3",
						selector: ".columns-3--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(3, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGG8WC42WYRCSDKKB6JFQ9",
						selector: ".columns-4--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(4, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGGA3TVSFCPF2CJ33NWHJW",
						selector: ".columns-5--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(5, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGGBF09K5404DZP15CK25Z",
						selector: ".columns-6--on-m",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(6, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGFS118Y66C444FR3N2PRG",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGNGWXK6WVESHT7K3QBPZX",
						selector: ".column--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "1fr",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
							{
								property: "grid-auto-flow",
								value: "row",
								fluidValue: [0, 0, "px"],
								id: "01H4DV5B56P9F9P8J2R27P7E1K",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01H4DV57S9SAHM6MBRY9MFDY8P",
						selector: ".row--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "1fr",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
							{
								property: "grid-auto-flow",
								value: "column",
								fluidValue: [0, 0, "px"],
								id: "01H4DV5G81B4MT5W4Y6XWCYAMN",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGP1PG7S04VDZ0D5YVCRFM",
						selector: ".columns-2--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(2, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGPF30TYTX6KRRCDS7F233",
						selector: ".columns-3--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(3, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGV00E117NT66247T16TAH",
						selector: ".columns-4--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(4, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGV1QNPZRQKNWJEY9CATNX",
						selector: ".columns-5--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(5, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGV30HD83HP8BGW8HX88D6",
						selector: ".columns-6--on-s",
						declarations: [
							{
								property: "grid-template-columns",
								value: "repeat(6, 1fr)",
								fluidValue: [0, 0, "px"],
								id: "01GWSGNGWXZP9821GA21NNSEAM",
							},
						],
						mediaQuery: [0, 480],
					},
				],
			},
			{
				id: "01GXVZT05C5JBRWPMDGPXCS0D5",
				name: "Automatic Columns",
				cssObjects: [
					{
						id: "01GXVZT05CQ64KJB1VRB54VPSB",
						selector: ".columns-min-5",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZE966YS00JTJQVVWMY4ZT",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(5rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW05GR0BQDETSGEQ8ZCRM3S",
							},
						],
					},
					{
						id: "01GXVZYQEHKB4184X6CNV87QG0",
						selector: ".columns-min-10",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZEGMJ2YCYG22N17F28Q8E",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(10rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW05W3357Z4T496E2466S74",
							},
						],
					},
					{
						id: "01GXVZZPQ1F3EXXE0KS9AHWMWD",
						selector: ".columns-min-20",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZEPHWVKKSYSNF9CA1ZJYY",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(20rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW0678424QH9SD9Z8ZG32P5",
							},
						],
					},
					{
						id: "01GXW002VH098ZN9SVHPD3F4ZG",
						selector: ".columns-min-30",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZEW6BK9T1Z9DHJ95DWQ6N",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(30rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW0687MGVX9N932X8EAZN80",
							},
						],
					},
					{
						id: "01GXW0141R1PBYYV4S0XSH3NHQ",
						selector: ".columns-min-40",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZF277V536DDJZ8Y0J7DBP",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(40rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW0699ZR2CJC7A05977MTZG",
							},
						],
					},
					{
						id: "01GXW01BQWMSNNXR8BMQN0YGGY",
						selector: ".columns-min-50",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZF8K8Q39NP6CKAJY6X9B5",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(50rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW06A9V772C9WR99JGCKPBX",
							},
						],
					},
					{
						id: "01GXW01HYJQ4F42B8HYWZH9BAW",
						selector: ".columns-min-60",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZFDEHJ4FNW7FB53JX7T7H",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(60rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW0743JWBMESA7FCJKXM9K8",
							},
						],
					},
					{
						id: "01GXW01R4ZQTNNYTJNE9FP34W5",
						selector: ".columns-min-70",
						declarations: [
							{
								property: "display",
								value: "grid",
								fluidValue: [0, 0, "px"],
								id: "01H4DZFKVK1QCSSM81BJXVYHHJ",
							},
							{
								property: "grid-template-columns",
								value: "repeat(auto-fit,minmax(70rem, 1fr))",
								fluidValue: [0, 0, "px"],
								id: "01GXW0799QNYXNA65GR82YDZBG",
							},
						],
					},
				],
			},
			{
				id: "01H4DZA9X6WB52X7TDHSSGGD81",
				name: "Simple Flex Layouts",
				cssObjects: [
					{
						id: "01H4DZA9X6HXTEM6AXVZ6G7JRB",
						selector: ".flex-row",
						declarations: [
							{
								property: "display",
								value: "flex",
								fluidValue: [0, 0, "px"],
								id: "01H4DZA9X62H747WTN3Y8F004N",
							},
							{
								property: "flex-direction",
								value: "row",
								fluidValue: [0, 0, "px"],
								id: "01H4DZBDJ9QJ73KAKQJ3SV8KBV",
							},
						],
					},
					{
						id: "01H4DZBQNB7AGVG5WZWMTD7ZPW",
						selector: ".flex-column",
						declarations: [
							{
								property: "display",
								value: "flex",
								fluidValue: [0, 0, "px"],
								id: "01H4DZA9X62H747WTN3Y8F004N",
							},
							{
								property: "flex-direction",
								value: "column",
								fluidValue: [0, 0, "px"],
								id: "01H4DZBDJ9QJ73KAKQJ3SV8KBV",
							},
						],
					},
					{
						id: "01H4DZC4CG1THQQV8VZXDKN5CJ",
						selector: ".flex-1",
						declarations: [
							{
								property: "flex",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01H4DZC4CG9XMWYS6S12TAPEHA",
							},
						],
					},
					{
						id: "01H7XESPQKG2WPT16R6ZQH5JNF",
						selector: ".flex-2",
						declarations: [
							{
								property: "flex",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01H4DZC4CG9XMWYS6S12TAPEHA",
							},
						],
					},
					{
						id: "01H7XET148D9B2555P9FPME5FZ",
						selector: ".flex-3",
						declarations: [
							{
								property: "flex",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01H4DZC4CG9XMWYS6S12TAPEHA",
							},
						],
					},
					{
						id: "01H4DZCFR06X9FBF6DJDZ7XE45",
						selector: ".flex-wrap",
						declarations: [
							{
								property: "flex-wrap",
								value: "wrap",
								fluidValue: [0, 0, "px"],
								id: "01H4DZCFR0YE7H292DECJCT10B",
							},
						],
					},
					{
						id: "01H4DZCTVEA4PGMXQ40AD9Y25F",
						selector: ".flex-nowrap",
						declarations: [
							{
								property: "flex-wrap",
								value: "nowrap",
								fluidValue: [0, 0, "px"],
								id: "01H4DZCFR0YE7H292DECJCT10B",
							},
						],
					},
				],
			},
			{
				id: "4",
				name: "Grid Column Span",
				cssObjects: [
					{
						id: "01GTC7QS6T8GBWV36F1XGGBPZ5",
						selector: ".col-span-2",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GTC7QS6T92R9BFB8H4PD3J9K",
							},
						],
					},
					{
						id: "01GTC7R8CG9ES0HP71ATV4P2T0",
						selector: ".col-span-3",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GTC7R8CGX7B9HHCEZ33X726V",
							},
						],
					},
					{
						id: "01GTC7RFP9CGP79TXX79G53605",
						selector: ".col-span-4",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GTC7RFP9X9J7A7C35A5WY1JV",
							},
						],
					},
					{
						id: "01GTC7RR4NZ9C21CG7WD54NWX6",
						selector: ".col-span-5",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GTC7RR4N4XFKZ8GSFYQWPEW7",
							},
						],
					},
					{
						id: "01GTC7S2F0A73CAWAZ293QTT2M",
						selector: ".col-span-6",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GTC7S2F02GTRAKTY516PXWTH",
							},
						],
					},
					{
						id: "01H2D809TXCYB7T1W46J09C2RD",
						selector: ".col-span-7",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 7",
								fluidValue: [0, 0, "px"],
								id: "01GTC7S2F02GTRAKTY516PXWTH",
							},
						],
					},
					{
						id: "01H2D80FSCVP7GDHEJ8BS9N34Y",
						selector: ".col-span-8",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 8",
								fluidValue: [0, 0, "px"],
								id: "01GTC7S2F02GTRAKTY516PXWTH",
							},
						],
					},
					{
						id: "01GWSG0ZWA1J84XHJ0CTRM9N7F",
						selector: ".col-span-1--on-xl",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSG0ZWA4HFK3NX7K9DW3MV1",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG1QSGF14KV4KZNATJMNR5",
						selector: ".col-span-2--on-xl",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSG0ZWA4HFK3NX7K9DW3MV1",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG1PPVPT2X395ZRX7X1XPR",
						selector: ".col-span-3--on-xl",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSG0ZWA4HFK3NX7K9DW3MV1",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG1NHTH471ATMV6GST1ET2",
						selector: ".col-span-4--on-xl",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSG0ZWA4HFK3NX7K9DW3MV1",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG1MF3X5RXMJSYJMFWSF1X",
						selector: ".col-span-5--on-xl",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSG0ZWA4HFK3NX7K9DW3MV1",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG1JVWHGFPR8EA62H9N875",
						selector: ".col-span-6--on-xl",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSG0ZWA4HFK3NX7K9DW3MV1",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG9J8F7T0G8VYGN57PJNZ6",
						selector: ".col-span-1--on-l",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSG9J8FCVF8JBNYG9PWHSWB",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG9W4Y6NW65A7Y6WZ6PNAH",
						selector: ".col-span-2--on-l",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSG9J8FCVF8JBNYG9PWHSWB",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG9XNWR5EKMSARWMEGTSPZ",
						selector: ".col-span-3--on-l",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSG9J8FCVF8JBNYG9PWHSWB",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSG9ZW57BKVDW5M044R2C63",
						selector: ".col-span-4--on-l",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSG9J8FCVF8JBNYG9PWHSWB",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGA1BYFYEHDDVWVFDVEJJN",
						selector: ".col-span-5--on-l",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSG9J8FCVF8JBNYG9PWHSWB",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGA2PJ7K076SKYM8ZTWTXN",
						selector: ".col-span-6--on-l",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSG9J8FCVF8JBNYG9PWHSWB",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGH177RCX4E0JK0AZDFBVB",
						selector: ".col-span-1--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGH177WXZ9E9499NGQNK64",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGH9H9CFJHQR6D3W7CHKXT",
						selector: ".col-span-2--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGH177WXZ9E9499NGQNK64",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGHCEXF7MMQ7Z15CHBY3VM",
						selector: ".col-span-3--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGH177WXZ9E9499NGQNK64",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGHE8B6T1X012Z9G4S51SB",
						selector: ".col-span-4--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGH177WXZ9E9499NGQNK64",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGHFPH9BR6M3KXBDC5600H",
						selector: ".col-span-5--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGH177WXZ9E9499NGQNK64",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGHGYHZ4GH28G3A9GZFJKW",
						selector: ".col-span-6--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGH177WXZ9E9499NGQNK64",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGP6B1VBBP4BNN4FCM0PT9",
						selector: ".col-span-1--on-s",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGP6B17PN7735DAA90KM13",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGQBPM0CAZRT8FVSYPJ81M",
						selector: ".col-span-2--on-s",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGP6B17PN7735DAA90KM13",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGQFG6D4AKR1P8YTR6B2W8",
						selector: ".col-span-3--on-s",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGP6B17PN7735DAA90KM13",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGTH3KQ8P3T0SQ5ZY1T1VH",
						selector: ".col-span-4--on-s",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGP6B17PN7735DAA90KM13",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGTJJCYPDQFPJBCJPRFMD2",
						selector: ".col-span-5--on-s",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGP6B17PN7735DAA90KM13",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGTMJ9TYPG1F9Q9AABKHFE",
						selector: ".col-span-6--on-s",
						declarations: [
							{
								property: "grid-column",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGP6B17PN7735DAA90KM13",
							},
						],
						mediaQuery: [0, 480],
					},
				],
			},
			{
				id: "5",
				name: "Grid Column Start",
				cssObjects: [
					{
						id: "01GTC7SH2VZJC2DWYZHM9D5PHS",
						selector: ".col-start-1",
						declarations: [
							{
								property: "grid-column-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GTC7SH2VY4KDTHPCEACY93AB",
							},
						],
					},
					{
						id: "01H5YVFP76BS7976KYE765NSZE",
						selector: ".col-start-2",
						declarations: [
							{
								property: "grid-column-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GTC7SH2VY4KDTHPCEACY93AB",
							},
						],
					},
					{
						id: "01GTC7T0V83AKXK1GBYN8S4SZY",
						selector: ".col-start-3",
						declarations: [
							{
								property: "grid-column-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GTC7T0V8B1TJGM65V9JTBPSM",
							},
						],
					},
					{
						id: "01GTC7T3HWQG0ZSFHSAMSR4N1Z",
						selector: ".col-start-4",
						declarations: [
							{
								property: "grid-column-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GTC7T3HWRV9TSEYFDZQ1NH01",
							},
						],
					},
					{
						id: "01GTC7T4KGPBC5VV9SPFDEFBW3",
						selector: ".col-start-5",
						declarations: [
							{
								property: "grid-column-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GTC7T4KG69WPMPXQNWC9VQYW",
							},
						],
					},
					{
						id: "01GTC7T57RQH0RCYVAX2GF0EDZ",
						selector: ".col-start-6",
						declarations: [
							{
								property: "grid-column-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GTC7T57SFDJV1G0808BV04F0",
							},
						],
					},
					{
						id: "01H2D80QEG0B1M3SH4045FEJQ2",
						selector: ".col-start-7",
						declarations: [
							{
								property: "grid-column-start",
								value: "7",
								fluidValue: [0, 0, "px"],
								id: "01GTC7T57SFDJV1G0808BV04F0",
							},
						],
					},
					{
						id: "01H2D80X2RDYAC31D979N6F9F7",
						selector: ".col-start-8",
						declarations: [
							{
								property: "grid-column-start",
								value: "8",
								fluidValue: [0, 0, "px"],
								id: "01GTC7T57SFDJV1G0808BV04F0",
							},
						],
					},
					{
						id: "01GWSG4P4X69FYPR3ZSPR6S9JB",
						selector: ".col-start-1--on-xl",
						declarations: [
							{
								property: "grid-column-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSG4P4X9CXW69VH0162B6B2",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG4YM4303BJX61Q63TQDNH",
						selector: ".col-start-2--on-xl",
						declarations: [
							{
								property: "grid-column-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSG4P4X9CXW69VH0162B6B2",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG52MCWEJV3PNPZH365HNA",
						selector: ".col-start-3--on-xl",
						declarations: [
							{
								property: "grid-column-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSG4P4X9CXW69VH0162B6B2",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG547BQ3T71FNSEQS6Q2M6",
						selector: ".col-start-4--on-xl",
						declarations: [
							{
								property: "grid-column-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSG4P4X9CXW69VH0162B6B2",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG4ZYGE7RS5BPBG4Y2TDWZ",
						selector: ".col-start-5--on-xl",
						declarations: [
							{
								property: "grid-column-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSG4P4X9CXW69VH0162B6B2",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG519HD5SZSJEAY5SCEGN3",
						selector: ".col-start-6--on-xl",
						declarations: [
							{
								property: "grid-column-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSG4P4X9CXW69VH0162B6B2",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSGAHKSBA16SPHN7ZMF864D",
						selector: ".col-start-1--on-l",
						declarations: [
							{
								property: "grid-column-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGAHKS2CGRH3JGAPMEJJN2",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGAZW2NSGFZ9V6E94SG447",
						selector: ".col-start-2--on-l",
						declarations: [
							{
								property: "grid-column-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGAHKS2CGRH3JGAPMEJJN2",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGB4WQNTS8ES412MW2GRXD",
						selector: ".col-start-3--on-l",
						declarations: [
							{
								property: "grid-column-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGAHKS2CGRH3JGAPMEJJN2",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGB644B6EGPA81J4E5FBJY",
						selector: ".col-start-4--on-l",
						declarations: [
							{
								property: "grid-column-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGAHKS2CGRH3JGAPMEJJN2",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGB7KBNSWC3D3SRKB3H48D",
						selector: ".col-start-5--on-l",
						declarations: [
							{
								property: "grid-column-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGAHKS2CGRH3JGAPMEJJN2",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGB9E1MX21W9WQG46K2807",
						selector: ".col-start-6--on-l",
						declarations: [
							{
								property: "grid-column-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGAHKS2CGRH3JGAPMEJJN2",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGJ0NXCXFW1YCSZBWDBF7V",
						selector: ".col-start-1--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJ0NXW72GQE5ZP236A2R6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGJC3D18DAPGFEN486P1RH",
						selector: ".col-start-2--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJ0NXW72GQE5ZP236A2R6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGJDG0D97P2F4E44NRC1HM",
						selector: ".col-start-3--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJ0NXW72GQE5ZP236A2R6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGJEX8TF8FZ086CF0FR2QW",
						selector: ".col-start-4--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJ0NXW72GQE5ZP236A2R6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGJG2KSC84HHV7EC6NE60M",
						selector: ".col-start-5--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJ0NXW72GQE5ZP236A2R6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGJH8JBDPN1Y7ZJ45MZQYK",
						selector: ".col-start-6--on-m",
						declarations: [
							{
								property: "grid-column",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJ0NXW72GQE5ZP236A2R6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGQPHNXRPN60GZ2F47W3DK",
						selector: ".col-start-1--on-s",
						declarations: [
							{
								property: "grid-column-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGQPHPX50887YW8AT9SQE9",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGR129QJYPA78C7RG5CGYB",
						selector: ".col-start-2--on-s",
						declarations: [
							{
								property: "grid-column-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGQPHPX50887YW8AT9SQE9",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGR4SJF0SH63MCBH8Z8R70",
						selector: ".col-start-3--on-s",
						declarations: [
							{
								property: "grid-column-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGQPHPX50887YW8AT9SQE9",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGRE3BGXRD63DRTE5MSMTN",
						selector: ".col-start-4--on-s",
						declarations: [
							{
								property: "grid-column-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGQPHPX50887YW8AT9SQE9",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGRFN3R3665TMGVCY0RM73",
						selector: ".col-start-5--on-s",
						declarations: [
							{
								property: "grid-column-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGQPHPX50887YW8AT9SQE9",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGRGSX542Y3EE2535YNGHS",
						selector: ".col-start-6--on-s",
						declarations: [
							{
								property: "grid-column-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGQPHPX50887YW8AT9SQE9",
							},
						],
						mediaQuery: [0, 480],
					},
				],
			},
			{
				id: "6",
				name: "Grid Row Span",
				cssObjects: [
					{
						id: "01GTC7VTX188CRCQA1V1C0C7DT",
						selector: ".row-span-2",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GTC7VTX1TKW3YW6KZDMTPAQV",
							},
						],
					},
					{
						id: "01GTC7X76MHRXYJB4D1RVGHTE3",
						selector: ".row-span-3",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GTC7X76MTN5J1YZ67F89WWE2",
							},
						],
					},
					{
						id: "01GTC7XFPHKME3B7V1P6VMRHGC",
						selector: ".row-span-4",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GTC7XFPHBHZ5XYX8CB11PFDG",
							},
						],
					},
					{
						id: "01GTC7XMZ5SD7W7XP0D1M0MSZR",
						selector: ".row-span-5",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GTC7XMZ5H1VJPGJ2RX8JFK2K",
							},
						],
					},
					{
						id: "01GTC7XPB0XDKK8AWSTFE8B8B9",
						selector: ".row-span-6",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GTC7XPB0A1A302CBVZP90ME8",
							},
						],
					},
					{
						id: "01H2D813FD5P86SCHXX18NN832",
						selector: ".row-span-7",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 7",
								fluidValue: [0, 0, "px"],
								id: "01GTC7XPB0A1A302CBVZP90ME8",
							},
						],
					},
					{
						id: "01H2D818MKBN3PVDC5D5KKJP7R",
						selector: ".row-span-8",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 8",
								fluidValue: [0, 0, "px"],
								id: "01GTC7XPB0A1A302CBVZP90ME8",
							},
						],
					},
					{
						id: "01GWSG28CFJMY0VV40Q10G2RRF",
						selector: ".row-span-1--on-xl",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSG28CFGM3HSN5XWH1Q0PJ6",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG2WWDCDGVKY3R1KQ1C22Y",
						selector: ".row-span-2--on-xl",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSG28CFGM3HSN5XWH1Q0PJ6",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG2VNQJ379B4P2VBX5JNPY",
						selector: ".row-span-3--on-xl",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSG28CFGM3HSN5XWH1Q0PJ6",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG2SNQ5ENSYX360H103HXM",
						selector: ".row-span-4--on-xl",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSG28CFGM3HSN5XWH1Q0PJ6",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG2PF6YC3DK1SNXSXTRF2F",
						selector: ".row-span-5--on-xl",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSG28CFGM3HSN5XWH1Q0PJ6",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG2MY5D4R0V2AQ39RVW3NX",
						selector: ".row-span-6--on-xl",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSG28CFGM3HSN5XWH1Q0PJ6",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSGBNM4MNAZCJZBVCJNFT2N",
						selector: ".row-span-1--on-l",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGBNM40DJE1MKM9MD8FGN0",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGD8JY0Q1Q3ZKWMJWRCZ2D",
						selector: ".row-span-2--on-l",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGBNM40DJE1MKM9MD8FGN0",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGD9W2MRN2F55NDSVV75F2",
						selector: ".row-span-3--on-l",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGBNM40DJE1MKM9MD8FGN0",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGDB2NNVX9M7WD5V34NK0S",
						selector: ".row-span-4--on-l",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGBNM40DJE1MKM9MD8FGN0",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGDC80E6MH9W246YPMX9G5",
						selector: ".row-span-5--on-l",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGBNM40DJE1MKM9MD8FGN0",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGDDW4X9QQZTRDFDF1T7CX",
						selector: ".row-span-6--on-l",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGBNM40DJE1MKM9MD8FGN0",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGJYZZX6CZ1V48118AVK55",
						selector: ".row-span-1--on-m",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJYZZHN0PVSTR40M7D5G6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGKB5JGPHQ3SKHQV3AQT7S",
						selector: ".row-span-2--on-m",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJYZZHN0PVSTR40M7D5G6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGKCC7749JP8P12TZ5DCGP",
						selector: ".row-span-3--on-m",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJYZZHN0PVSTR40M7D5G6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGKDVFKH8DHSRTKYZDG4XB",
						selector: ".row-span-4--on-m",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJYZZHN0PVSTR40M7D5G6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGKFEXS8P7014NW8CJ2G3A",
						selector: ".row-span-5--on-m",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJYZZHN0PVSTR40M7D5G6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGKGVZE8ZS8NKXACHT2KBT",
						selector: ".row-span-6--on-m",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGJYZZHN0PVSTR40M7D5G6",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGRBQ2H6EX1305M2YX3N8E",
						selector: ".row-span-1--on-s",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGRBQ244P2W1HW94S7F2VV",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGS60DJEQT6R091EP45CPA",
						selector: ".row-span-2--on-s",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGRBQ244P2W1HW94S7F2VV",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGSK0YXK7R03SQXT5G0RW6",
						selector: ".row-span-3--on-s",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGRBQ244P2W1HW94S7F2VV",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGSXJB3A1P31F416C8J1XH",
						selector: ".row-span-4--on-s",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGRBQ244P2W1HW94S7F2VV",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGT245QWRABTPEY950K1S8",
						selector: ".row-span-5--on-s",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGRBQ244P2W1HW94S7F2VV",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGT7GJ9W3E6Y0ERNF71946",
						selector: ".row-span-6--on-s",
						declarations: [
							{
								property: "grid-row",
								value: "auto / span 6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGRBQ244P2W1HW94S7F2VV",
							},
						],
						mediaQuery: [0, 480],
					},
				],
			},
			{
				id: "7",
				name: "Grid Row Start",
				cssObjects: [
					{
						id: "01GTC7TKP29FGAX9YJM6DA8VH2",
						selector: ".row-start-1",
						declarations: [
							{
								property: "grid-row-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GTC7TKP2P06YVQD7CHRH0MRX",
							},
						],
					},
					{
						id: "01H5YVFXAE0JB8WDJAJTZHDQCH",
						selector: ".row-start-2",
						declarations: [
							{
								property: "grid-row-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GTC7TKP2P06YVQD7CHRH0MRX",
							},
						],
					},
					{
						id: "01GTC7TWYER6G48BCAF4JYN88M",
						selector: ".row-start-3",
						declarations: [
							{
								property: "grid-row-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GTC7TWYEAV0G3XHCV8DMREYF",
							},
						],
					},
					{
						id: "01GTC7TXSHJTZ5VEMZB6GRHRDX",
						selector: ".row-start-4",
						declarations: [
							{
								property: "grid-row-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GTC7TXSHPKJH81GT8D5VTFS5",
							},
						],
					},
					{
						id: "01GTC7TZJM7AGSANHMZ3CCQ49F",
						selector: ".row-start-5",
						declarations: [
							{
								property: "grid-row-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GTC7TZJM61F7DQDB264Q40Q0",
							},
						],
					},
					{
						id: "01GTC7V08DSCE8BPCZP3CZDG8G",
						selector: ".row-start-6",
						declarations: [
							{
								property: "grid-row-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GTC7V08DBK3MBM20R0KT196Y",
							},
						],
					},
					{
						id: "01H2D81F5DCTZCTR3ANYEHWR5B",
						selector: ".row-start-7",
						declarations: [
							{
								property: "grid-row-start",
								value: "7",
								fluidValue: [0, 0, "px"],
								id: "01GTC7V08DBK3MBM20R0KT196Y",
							},
						],
					},
					{
						id: "01H2D81N3M5E67GGHQG80TABK2",
						selector: ".row-start-8",
						declarations: [
							{
								property: "grid-row-start",
								value: "8",
								fluidValue: [0, 0, "px"],
								id: "01GTC7V08DBK3MBM20R0KT196Y",
							},
						],
					},
					{
						id: "01GWSG3FXNK5WHCHGEMT13BX2G",
						selector: ".row-start-1--on-xl",
						declarations: [
							{
								property: "grid-row-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSG3FXNC2Y8DSD75T1JSQE4",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG3X234JA706AQHG19NZKW",
						selector: ".row-start-2--on-xl",
						declarations: [
							{
								property: "grid-row-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSG3FXNC2Y8DSD75T1JSQE4",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG3YJBBAWDYQMRDG61GWH6",
						selector: ".row-start-3--on-xl",
						declarations: [
							{
								property: "grid-row-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSG3FXNC2Y8DSD75T1JSQE4",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG40GS1VP82M4WJDTD60JB",
						selector: ".row-start-4--on-xl",
						declarations: [
							{
								property: "grid-row-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSG3FXNC2Y8DSD75T1JSQE4",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG421Q264925RN606HK7J5",
						selector: ".row-start-5--on-xl",
						declarations: [
							{
								property: "grid-row-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSG3FXNC2Y8DSD75T1JSQE4",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSG443B0YD8EJY5PNFEWTTW",
						selector: ".row-start-6--on-xl",
						declarations: [
							{
								property: "grid-row-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSG3FXNC2Y8DSD75T1JSQE4",
							},
						],
						mediaQuery: [0, 1400],
					},
					{
						id: "01GWSGDZD2X26AXF10C17RM9XQ",
						selector: ".row-start-1--on-l",
						declarations: [
							{
								property: "grid-row-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGDZD2ZQJE5V0NQTZVJ49B",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGEAR3GAHZZVZM49M04BVV",
						selector: ".row-start-2--on-l",
						declarations: [
							{
								property: "grid-row-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGDZD2ZQJE5V0NQTZVJ49B",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGECDJ955GGVRST41H2HQ4",
						selector: ".row-start-3--on-l",
						declarations: [
							{
								property: "grid-row-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGDZD2ZQJE5V0NQTZVJ49B",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGEDR5YYZ6ZHCXJA6S8GPW",
						selector: ".row-start-4--on-l",
						declarations: [
							{
								property: "grid-row-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGDZD2ZQJE5V0NQTZVJ49B",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGEFQ18Z01ZTDAQ3JRC607",
						selector: ".row-start-5--on-l",
						declarations: [
							{
								property: "grid-row-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGDZD2ZQJE5V0NQTZVJ49B",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGEH78QXK7SH6M0SFR6J7X",
						selector: ".row-start-6--on-l",
						declarations: [
							{
								property: "grid-row-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGDZD2ZQJE5V0NQTZVJ49B",
							},
						],
						mediaQuery: [0, 992],
					},
					{
						id: "01GWSGKYMBXWBK0XZ9GMM4SQF8",
						selector: ".row-start-1--on-m",
						declarations: [
							{
								property: "grid-row-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGKYMBN93PVREXJK58A2GW",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGM87GV2XNYYCRFT9DNQXE",
						selector: ".row-start-2--on-m",
						declarations: [
							{
								property: "grid-row-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGKYMBN93PVREXJK58A2GW",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGM9S160T8YQB65Y1D18SS",
						selector: ".row-start-3--on-m",
						declarations: [
							{
								property: "grid-row-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGKYMBN93PVREXJK58A2GW",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGMB56YCG505DVMNSQ7R4G",
						selector: ".row-start-4--on-m",
						declarations: [
							{
								property: "grid-row-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGKYMBN93PVREXJK58A2GW",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGMEZNM39F59RPEVR6CAJ2",
						selector: ".row-start-5--on-m",
						declarations: [
							{
								property: "grid-row-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGKYMBN93PVREXJK58A2GW",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGMDGVPA0Y0QFYP8W9VDTW",
						selector: ".row-start-6--on-m",
						declarations: [
							{
								property: "grid-row-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGKYMBN93PVREXJK58A2GW",
							},
						],
						mediaQuery: [0, 768],
					},
					{
						id: "01GWSGVXRCP6A1Z3T2B093XHRH",
						selector: ".row-start-1--on-s",
						declarations: [
							{
								property: "grid-row-start",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSGVXRC21WS0NAWZ843QPDJ",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGWJQX653MBJG9QQ9RP25S",
						selector: ".row-start-2--on-s",
						declarations: [
							{
								property: "grid-row-start",
								value: "2",
								fluidValue: [0, 0, "px"],
								id: "01GWSGVXRC21WS0NAWZ843QPDJ",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGWMDKCC6T8S27R48DVK3M",
						selector: ".row-start-3--on-s",
						declarations: [
							{
								property: "grid-row-start",
								value: "3",
								fluidValue: [0, 0, "px"],
								id: "01GWSGVXRC21WS0NAWZ843QPDJ",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGWPA0RT9DNVEZ08XMYDN7",
						selector: ".row-start-4--on-s",
						declarations: [
							{
								property: "grid-row-start",
								value: "4",
								fluidValue: [0, 0, "px"],
								id: "01GWSGVXRC21WS0NAWZ843QPDJ",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGWQSSY2Z9D7FX64ZQWSKP",
						selector: ".row-start-5--on-s",
						declarations: [
							{
								property: "grid-row-start",
								value: "5",
								fluidValue: [0, 0, "px"],
								id: "01GWSGVXRC21WS0NAWZ843QPDJ",
							},
						],
						mediaQuery: [0, 480],
					},
					{
						id: "01GWSGWS86ZC53A8YAE5948A5S",
						selector: ".row-start-6--on-s",
						declarations: [
							{
								property: "grid-row-start",
								value: "6",
								fluidValue: [0, 0, "px"],
								id: "01GWSGVXRC21WS0NAWZ843QPDJ",
							},
						],
						mediaQuery: [0, 480],
					},
				],
			},
			{
				id: "01FSAJW86GMKQ8PBKBC1W2BNVM",
				name: "Alignments",
				cssObjects: [
					{
						id: "01GWSKK6M0PWCTMNP59SEJWWS2",
						selector: ".items-left",
						declarations: [
							{
								property: "justify-items",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01GWSKK6M0MQ3HYM0HCGMMW670",
							},
						],
					},
					{
						id: "01GXVT13NQHNKYCR8Q0XMJDF2Q",
						selector: ".content-left",
						declarations: [
							{
								property: "justify-content",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01GWSKK6M0MQ3HYM0HCGMMW670",
							},
						],
					},
					{
						id: "01GWSKKWVBGCE10TVVAX69T3AC",
						selector: ".items-center",
						declarations: [
							{
								property: "justify-items",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GWSKK6M0MQ3HYM0HCGMMW670",
							},
						],
					},
					{
						id: "01GXVT1EZ4EK5AZAARDWXM5WS9",
						selector: ".content-center",
						declarations: [
							{
								property: "justify-content",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GWSKK6M0MQ3HYM0HCGMMW670",
							},
						],
					},
					{
						id: "01GWSKM2HKFHB7Q5DA95R8W9MP",
						selector: ".items-right",
						declarations: [
							{
								property: "justify-items",
								value: "end",
								fluidValue: [0, 0, "px"],
								id: "01GWSKK6M0MQ3HYM0HCGMMW670",
							},
						],
					},
					{
						id: "01GXVT1NCZD017BKKKCF4XRZPN",
						selector: ".content-right",
						declarations: [
							{
								property: "justify-content",
								value: "end",
								fluidValue: [0, 0, "px"],
								id: "01GWSKK6M0MQ3HYM0HCGMMW670",
							},
						],
					},
					{
						id: "01GWSKM9A53VT71CMKWSQGMC0G",
						selector: ".items-top",
						declarations: [
							{
								property: "align-items",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVT1VZC67G92WMZJSR5AJF2",
						selector: ".content-top",
						declarations: [
							{
								property: "align-content",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GWSKN0QEWWN9H2MT8RENA4N6",
						selector: ".items-middle",
						declarations: [
							{
								property: "align-items",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVT286360DAEWWJGY3AV2EH",
						selector: ".content-middle",
						declarations: [
							{
								property: "align-content",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GWSKN73EH2TPGX60KG8E53Q4",
						selector: ".items-bottom",
						declarations: [
							{
								property: "align-items",
								value: "end",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVT2G5J761CSXNXHATVRRJ0",
						selector: ".content-bottom",
						declarations: [
							{
								property: "align-content",
								value: "end",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVSY3TWS9DKTXGN3Q4HFT31",
						selector: ".items-stretch",
						declarations: [
							{
								property: "align-items",
								value: "stretch",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVT36DM0FRZEMGF2N01FEVY",
						selector: ".content-stretch",
						declarations: [
							{
								property: "justify-content",
								value: "stretch",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVT2R1KWCNQ1BY1D2XV6KRJ",
						selector: ".space-between",
						declarations: [
							{
								property: "justify-content",
								value: "space-between",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
					{
						id: "01GXVT2ZGJKX4D16TCKHHANBSP",
						selector: ".space-around",
						declarations: [
							{
								property: "justify-content",
								value: "space-around",
								fluidValue: [0, 0, "px"],
								id: "01GWSKM9A58PDJMEBHNP912A1N",
							},
						],
					},
				],
			},
			{
				id: "01GXW3WXXTN3TYEWB8PHW8GJRA",
				name: "Self Alignments",
				cssObjects: [
					{
						id: "01GXW3WXXYXRQRGGB52FBZX4A9",
						selector: ".self-left",
						declarations: [
							{
								property: "margin-right",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXW3WXXY1PAT7AH2E10EWVSG",
							},
							{
								property: "place-self",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01GXW3XQWXJCF628MDYYZFDEDF",
							},
						],
					},
					{
						id: "01GXW3Y0APTGT20ZCJ71TPH7JR",
						selector: ".self-center",
						declarations: [
							{
								property: "margin-inline",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXW3WXXY1PAT7AH2E10EWVSG",
							},
							{
								property: "place-self",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GXW3XQWXJCF628MDYYZFDEDF",
							},
						],
					},
					{
						id: "01GXW3ZEGET29MEXFWD4RSA7NF",
						selector: ".self-right",
						declarations: [
							{
								property: "margin-left",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXW3WXXY1PAT7AH2E10EWVSG",
							},
							{
								property: "place-self",
								value: "end",
								fluidValue: [0, 0, "px"],
								id: "01GXW3XQWXJCF628MDYYZFDEDF",
							},
						],
					},
					{
						id: "01GXW3ZXDF9JGYCWR6PYZPC3TT",
						selector: ".self-top",
						declarations: [
							{
								property: "margin-bottom",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXW3WXXY1PAT7AH2E10EWVSG",
							},
							{
								property: "align-self",
								value: "start",
								fluidValue: [0, 0, "px"],
								id: "01GXW3XQWXJCF628MDYYZFDEDF",
							},
						],
					},
					{
						id: "01GXW407NPDMN7NT5T329YYK4P",
						selector: ".self-middle",
						declarations: [
							{
								property: "margin-block",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXW3WXXY1PAT7AH2E10EWVSG",
							},
							{
								property: "align-self",
								value: "center",
								fluidValue: [0, 0, "px"],
								id: "01GXW3XQWXJCF628MDYYZFDEDF",
							},
						],
					},
					{
						id: "01GXW4099SCPSSG45N6DQ63BT9",
						selector: ".self-bottom",
						declarations: [
							{
								property: "margin-top",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXW3WXXY1PAT7AH2E10EWVSG",
							},
							{
								property: "align-self",
								value: "end",
								fluidValue: [0, 0, "px"],
								id: "01GXW3XQWXJCF628MDYYZFDEDF",
							},
						],
					},
					{
						id: "01GXW419Z74S9KTPQ9M4MQ257Y",
						selector: ".self-stretch",
						declarations: [
							{
								property: "align-self",
								value: "stretch",
								fluidValue: [0, 0, "px"],
								id: "01GXW419Z78E4P371BHQH59AMF",
							},
						],
					},
				],
			},
			{
				id: "01H5YVSTJ0BTAKP5PNK4G76ZB3",
				name: "Dimensions",
				cssObjects: [
					{
						id: "01H7XEF9WWEYHY04BPYNAA5G9F",
						selector: ".full-width",
						declarations: [
							{
								property: "width",
								value: "100%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H7XEFMHJFQR9KYHGZRCC131Q",
						selector: ".full-height",
						declarations: [
							{
								property: "height",
								value: "100%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVYWBFBAXR3388SQQHNHQT",
							},
						],
					},
					{
						id: "01H5YVSTJ090QVRFDW20M03H6S",
						selector: ".screen-width",
						declarations: [
							{
								property: "width",
								value: "100vw",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVYWBF3WVC3WEV8KE56064",
						selector: ".screen-height",
						declarations: [
							{
								property: "height",
								value: "100vh",
								fluidValue: [0, 0, "px"],
								id: "01H5YVYWBFBAXR3388SQQHNHQT",
							},
						],
					},
					{
						id: "01H5YVZN914EYAW0CH4JFP1ETE",
						selector: ".auto-width",
						declarations: [
							{
								property: "width",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YW01PTGET894SAGW1ZFW2K",
						selector: ".auto-height",
						declarations: [
							{
								property: "height",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01H5YVYWBFBAXR3388SQQHNHQT",
							},
						],
					},
					{
						id: "01H5YVTV75MF9NYQM9E500FP71",
						selector: ".width-90",
						declarations: [
							{
								property: "width",
								value: "90%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVV240Z1V08M98Q0Z324AH",
						selector: ".width-80",
						declarations: [
							{
								property: "width",
								value: "80%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVV44MGAMCT70MWWTNY8W6",
						selector: ".width-70",
						declarations: [
							{
								property: "width",
								value: "70%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVV5XFJFXN22ZEVB9B6ZWP",
						selector: ".width-60",
						declarations: [
							{
								property: "width",
								value: "60%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVV7QCGB9T600GYGB2HWJ9",
						selector: ".width-50",
						declarations: [
							{
								property: "width",
								value: "50%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVVEVYTTPBGVKYA0Z7YC3E",
						selector: ".width-40",
						declarations: [
							{
								property: "width",
								value: "40%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVV993TVQKNFQ5KNXJGWEB",
						selector: ".width-30",
						declarations: [
							{
								property: "width",
								value: "30%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVVB3B90VA80KCGYQ2PDTX",
						selector: ".width-20",
						declarations: [
							{
								property: "width",
								value: "20%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
					{
						id: "01H5YVVD151YCE48Y9B94FC8V8",
						selector: ".width-10",
						declarations: [
							{
								property: "width",
								value: "10%",
								fluidValue: [0, 0, "px"],
								id: "01H5YVSTJ0QNJEX4YC47PHPTVQ",
							},
						],
					},
				],
			},
			{
				id: "01GXDTDXJ18QFMXDG8TXGDVSJ1",
				name: "Max Width",
				cssObjects: [
					{
						id: "01GXK75734DAA6B9GH1PZQME6R",
						selector: ".max-site-width",
						declarations: [
							{
								property: "max-width",
								value: "var(--max-screen-width)",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
							{
								property: "width",
								value: "100%",
								fluidValue: [0, 0, "px"],
								id: "01H3CN8E6WYFTJ6H31R1Y6JM9N",
							},
						],
					},
					{
						id: "01GXW1SGAAMNPXWXFYRC4VGAMW",
						selector: ".max-width-140",
						declarations: [
							{
								property: "max-width",
								value: "140rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXW1T2NH399SFS8BCGD3T8RX",
						selector: ".max-width-130",
						declarations: [
							{
								property: "max-width",
								value: "130rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXKCHBXKV7AZB8JPN5Y41BWZ",
						selector: ".max-width-120",
						declarations: [
							{
								property: "max-width",
								value: "120rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXW1MX34Z6V6ZS81G92GV97P",
						selector: ".max-width-110",
						declarations: [
							{
								property: "max-width",
								value: "110rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXW1MVFDKK3CVSZHGRVS6YG9",
						selector: ".max-width-100",
						declarations: [
							{
								property: "max-width",
								value: "100rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK75QJC7ZX4R0YH10XE58JJ",
						selector: ".max-width-90",
						declarations: [
							{
								property: "max-width",
								value: "90rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK75Z6ZWQQGCD4BFTAD2ZEA",
						selector: ".max-width-80",
						declarations: [
							{
								property: "max-width",
								value: "80rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK7618SAYXVHAE1XHY2XDXH",
						selector: ".max-width-70",
						declarations: [
							{
								property: "max-width",
								value: "70rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK763PRJF9AHTM9V0K62A47",
						selector: ".max-width-60",
						declarations: [
							{
								property: "max-width",
								value: "60rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK765WQ0JK70GB64K5WNQ0Z",
						selector: ".max-width-50",
						declarations: [
							{
								property: "max-width",
								value: "50rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK767EPTJ8W6MNV93CM0RVS",
						selector: ".max-width-40",
						declarations: [
							{
								property: "max-width",
								value: "40rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK773HNNJWFQTX33MTC8DY6",
						selector: ".max-width-30",
						declarations: [
							{
								property: "max-width",
								value: "30rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK775A7WC6BC0C3S6TFBMJS",
						selector: ".max-width-20",
						declarations: [
							{
								property: "max-width",
								value: "20rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
					{
						id: "01GXK777WVZAC0ZKV9BY2VKS7H",
						selector: ".max-width-10",
						declarations: [
							{
								property: "max-width",
								value: "10rem",
								fluidValue: [0, 0, "px"],
								id: "01GXK757343GYTGVAEMZWG9CEE",
							},
						],
					},
				],
			},
		],
		designStyles: [
			{
				id: "01H2EGNWS2X44N2YW897SFK32N",
				name: "Border Radius - Vars",
				cssObjects: [
					{
						id: "01H2EGNWS2P4PRZ3S19R4VGE7R",
						selector: ":root",
						declarations: [
							{
								property: "--radius-xs",
								value: "0.25rem",
								type: "fluid",
								fluidValue: [4, 4, "px"],
								colorValue: "",
								id: "01H4DVCQDXGYP2FJA5DH0PZSP4",
							},
							{
								property: "--radius-s",
								value: ".5rem",
								type: "fluid",
								fluidValue: [6, 8, "px"],
								colorValue: "",
								id: "01H2EGNWS2TK937Z2R7YZECFQA",
							},
							{
								property: "--radius-m",
								value: ".75rem",
								type: "fluid",
								fluidValue: [10, 12, "px"],
								colorValue: "",
								id: "01H2EGQAPBM380XY32W420XP6X",
							},
							{
								property: "--radius-l",
								value: "1.25rem",
								type: "fluid",
								fluidValue: [16, 20, "px"],
								colorValue: "",
								id: "01H2EGQH9YV6DHJETPKMPMHEP3",
							},
							{
								property: "--radius-xl",
								value: "2rem",
								type: "fluid",
								fluidValue: [26, 32, "px"],
								colorValue: "",
								id: "01H5YW641DYAXGGFP339JBX1R9",
							},
							{
								property: "--radius-full",
								value: "999rem",
								id: "01H2EGQQR63YMBB2T4TVYG2753",
							},
						],
					},
				],
				type: "variable",
			},
			{
				id: "01GTC7ZMVYFBCVJQA1TWE28GWD",
				name: "Border Radius",
				cssObjects: [
					{
						id: "01GTC80AA0X5HJA92QZ81MG9XG",
						selector: ".radius-xs",
						declarations: [
							{
								property: "border-radius",
								value: "var(--radius-xs)",
								fluidValue: [0, 0, "px"],
								id: "01GTC80AA0EB5G9JDBF5Z7H70K",
							},
						],
					},
					{
						id: "01H4DVD63C61H6DEQZ7K25WMBK",
						selector: ".radius-s",
						declarations: [
							{
								property: "border-radius",
								value: "var(--radius-s)",
								fluidValue: [0, 0, "px"],
								id: "01GTC80AA0EB5G9JDBF5Z7H70K",
							},
						],
					},
					{
						id: "01GXW0ZVPE35AVVCZ7KF8E161E",
						selector: ".radius-m",
						declarations: [
							{
								property: "border-radius",
								value: "var(--radius-m)",
								fluidValue: [0, 0, "px"],
								id: "01GTC80AA0EB5G9JDBF5Z7H70K",
							},
						],
					},
					{
						id: "01GXBWN81WBABDQ0YBZTWQ88GF",
						selector: ".radius-l",
						declarations: [
							{
								property: "border-radius",
								value: "var(--radius-l)",
								fluidValue: [0, 0, "px"],
								id: "01GTC80AA0EB5G9JDBF5Z7H70K",
							},
						],
					},
					{
						id: "01H5YW7SGNW52675XJ6MR4MWB3",
						selector: ".radius-xl",
						declarations: [
							{
								property: "border-radius",
								value: "var(--radius-xl)",
								fluidValue: [0, 0, "px"],
								id: "01GTC80AA0EB5G9JDBF5Z7H70K",
							},
						],
					},
					{
						id: "01GXK8F621FX2B5B9VG488TJYR",
						selector: ".radius-full",
						declarations: [
							{
								property: "border-radius",
								value: "var(--radius-full)",
								fluidValue: [0, 0, "px"],
								id: "01GXK8F621AYQGBMTQY69EFZMV",
							},
						],
					},
				],
			},
			{
				id: "01H4DVF15W2F34MV2K95S3FSH2",
				name: "Borders",
				cssObjects: [
					{
						id: "01H4DVF15WJDGWA6V8YDV0RNN2",
						selector: ".border",
						declarations: [
							{
								property: "border-width",
								value: "1px",
								fluidValue: [0, 0, "px"],
								id: "01H4DVF15WJTC9CTS1CP5ZM8SW",
							},
							{
								property: "border-style",
								value: "solid",
								fluidValue: [0, 0, "px"],
								id: "01H4DVZF08WA4P9H905ZGD8G08",
							},
						],
					},
					{
						id: "01H4DW2B0W28ZCY5T4DVW27SXT",
						selector: ".border-left",
						declarations: [
							{
								property: "border-left-width",
								value: "1px",
								fluidValue: [0, 0, "px"],
								id: "01H4DVF15WJTC9CTS1CP5ZM8SW",
							},
							{
								property: "border-left-style",
								value: "solid",
								fluidValue: [0, 0, "px"],
								id: "01H4DVZF08WA4P9H905ZGD8G08",
							},
						],
					},
					{
						id: "01H4DW2A2W8XB8EHZ97V3FTFQN",
						selector: ".border-right",
						declarations: [
							{
								property: "border-right-width",
								value: "1px",
								fluidValue: [0, 0, "px"],
								id: "01H4DVF15WJTC9CTS1CP5ZM8SW",
							},
							{
								property: "border-right-style",
								value: "solid",
								fluidValue: [0, 0, "px"],
								id: "01H4DVZF08WA4P9H905ZGD8G08",
							},
						],
					},
					{
						id: "01H4DW295GW19J854B8JR9A5NN",
						selector: ".border-top",
						declarations: [
							{
								property: "border-top-width",
								value: "1px",
								fluidValue: [0, 0, "px"],
								id: "01H4DVF15WJTC9CTS1CP5ZM8SW",
							},
							{
								property: "border-top-style",
								value: "solid",
								fluidValue: [0, 0, "px"],
								id: "01H4DVZF08WA4P9H905ZGD8G08",
							},
						],
					},
					{
						id: "01H4DW281561DT9BQZQE64B8Q6",
						selector: ".border-bottom",
						declarations: [
							{
								property: "border-bottom-width",
								value: "1px",
								fluidValue: [0, 0, "px"],
								id: "01H4DVF15WJTC9CTS1CP5ZM8SW",
							},
							{
								property: "border-bottom-style",
								value: "solid",
								fluidValue: [0, 0, "px"],
								id: "01H4DVZF08WA4P9H905ZGD8G08",
							},
						],
					},
				],
			},
			{
				id: "01H4DV7QQKNR83PNVWXJB3P1YG",
				name: "Box Shadow - Vars",
				cssObjects: [
					{
						id: "01H4DV7QQKAP3SC73QTP8K58EK",
						selector: ":root",
						declarations: [
							{
								property: "--shadow-xs",
								value: "0 1px 2px var(--shadow-primary)",
								id: "01H5YV6ZBF21ZDEFNZ8XQDVE56",
							},
							{
								property: "--shadow-s",
								value: "0 1.5px 3px var(--shadow-primary)",
								id: "01H4DV7QQKCEYDRWBQA1PVEG47",
							},
							{
								property: "--shadow-m",
								value: "0 2px 6px var(--shadow-primary)",
								id: "01H5YV6H0RTJ2FF47FMJDEQGH7",
							},
							{
								property: "--shadow-l",
								value: "0 3px 12px var(--shadow-primary)",
								id: "01H4DV8CRDCBMSMXVJ90JQ656T",
							},
							{
								property: "--shadow-xl",
								value: "0 6px 48px var(--shadow-primary)",
								id: "01H4DV8DRXXGMS1228NXWG2B0R",
							},
						],
					},
				],
				type: "variable",
			},
			{
				id: "01GXKA17A82WXG7DEG2ZDYMV0R",
				name: "Shadows",
				cssObjects: [
					{
						id: "01GXKA17A8GJS28BQAK2Y3ZGSB",
						selector: ".shadow-xs",
						declarations: [
							{
								property: "box-shadow",
								value: "var(--shadow-xs)",
								fluidValue: [0, 0, "px"],
								id: "01GXKA17A80W3VHYPZZ65DXXHG",
							},
						],
					},
					{
						id: "01H5YVAVM12PHK4A77F5WVCWWX",
						selector: ".shadow-s",
						declarations: [
							{
								property: "box-shadow",
								value: "var(--shadow-s)",
								fluidValue: [0, 0, "px"],
								id: "01GXKA17A80W3VHYPZZ65DXXHG",
							},
						],
					},
					{
						id: "01GXKA45V5F75435GSR3255G61",
						selector: ".shadow-m",
						declarations: [
							{
								property: "box-shadow",
								value: "var(--shadow-m)",
								fluidValue: [0, 0, "px"],
								id: "01GXKA17A80W3VHYPZZ65DXXHG",
							},
						],
					},
					{
						id: "01GXKA47GJKNFGGHGJG1XW4E66",
						selector: ".shadow-l",
						declarations: [
							{
								property: "box-shadow",
								value: "var(--shadow-l)",
								fluidValue: [0, 0, "px"],
								id: "01GXKA17A80W3VHYPZZ65DXXHG",
							},
						],
					},
					{
						id: "01H5YVAX8111S78V3AE4384DX1",
						selector: ".shadow-xl",
						declarations: [
							{
								property: "box-shadow",
								value: "var(--shadow-xl)",
								fluidValue: [0, 0, "px"],
								id: "01GXKA17A80W3VHYPZZ65DXXHG",
							},
						],
					},
				],
			},
			{
				id: "01GTC83ZQZQZQZQZQZQZQZQZQZ",
				name: "Opacity",
				cssObjects: [
					{
						id: "01GXDTHQRKZ9JGWT01VZJWGNEM",
						selector: ".opacity-0",
						declarations: [
							{
								property: "opacity",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01GXDTHQRMXRNVP0VXCBQ4NCP3",
							},
						],
					},
					{
						id: "01GWSJGCE02K3DY0GZ0Y62CHGM",
						selector: ".opacity-10",
						declarations: [
							{
								property: "opacity",
								value: "0.1",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJGZJZ0KNRG24YK2WCA7GH",
						selector: ".opacity-20",
						declarations: [
							{
								property: "opacity",
								value: "0.2",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJH19YF2E8BJ89TT28BT82",
						selector: ".opacity-30",
						declarations: [
							{
								property: "opacity",
								value: "0.3",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJH36CGMJGKH0RX05BP2PY",
						selector: ".opacity-40",
						declarations: [
							{
								property: "opacity",
								value: "0.4",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJH4YJGM0S057BJCQ97303",
						selector: ".opacity-50",
						declarations: [
							{
								property: "opacity",
								value: "0.5",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJH7ABPDXFVZ5KDDAB9CS7",
						selector: ".opacity-60",
						declarations: [
							{
								property: "opacity",
								value: "0.6",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJH9M3DND3P6KPD8ZVTTJ4",
						selector: ".opacity-70",
						declarations: [
							{
								property: "opacity",
								value: "0.7",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJHB97061AJ2N492V2JQ24",
						selector: ".opacity-80",
						declarations: [
							{
								property: "opacity",
								value: "0.8",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJHD3YE7HTD62BVP55GDNB",
						selector: ".opacity-90",
						declarations: [
							{
								property: "opacity",
								value: "0.9",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
					{
						id: "01GWSJHFNKVF8K7FW83701AC1Z",
						selector: ".opacity-100",
						declarations: [
							{
								property: "opacity",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01GWSJGCE055RTPJV22YFT2ZBS",
							},
						],
					},
				],
			},
			{
				id: "01H6C0GJSF6T704SN3795A6F9J",
				name: "Aspect Ratios",
				cssObjects: [
					{
						id: "01H6C0GJSFVMJD3KHQMRMHQ8FM",
						selector: ".aspect-1",
						declarations: [
							{
								property: "aspect-ratio",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01H6C0GJSF89JKBZAHTY5EVH1J",
							},
						],
					},
					{
						id: "01H7WY3AEA2H0DZH51KZWD2VCP",
						selector: ".aspect-4-3",
						declarations: [
							{
								property: "aspect-ratio",
								value: "4 / 3",
								fluidValue: [0, 0, "px"],
								id: "01H7WY3AEA76CPM0M91AXND6HM",
							},
						],
					},
					{
						id: "01H7WY5XJV2EPYNXWC570QEKE6",
						selector: ".aspect-3-4",
						declarations: [
							{
								property: "aspect-ratio",
								value: "3 / 4",
								fluidValue: [0, 0, "px"],
								id: "01H7WY3AEA76CPM0M91AXND6HM",
							},
						],
					},
					{
						id: "01H7WY5T4VKFJ5M7AJ5ZF704KZ",
						selector: ".aspect-3-2",
						declarations: [
							{
								property: "aspect-ratio",
								value: "3 / 2",
								fluidValue: [0, 0, "px"],
								id: "01H7WY3AEA76CPM0M91AXND6HM",
							},
						],
					},
					{
						id: "01H7WY4MNCBG3BBNE0TTPGGPX9",
						selector: ".aspect-2-3",
						declarations: [
							{
								property: "aspect-ratio",
								value: "2 / 3",
								fluidValue: [0, 0, "px"],
								id: "01H7WY3AEA76CPM0M91AXND6HM",
							},
						],
					},
					{
						id: "01H7WY504KD75EAH8ABVQT3VY3",
						selector: ".aspect-16-9",
						declarations: [
							{
								property: "aspect-ratio",
								value: "16 / 9",
								fluidValue: [0, 0, "px"],
								id: "01H7WY3AEA76CPM0M91AXND6HM",
							},
						],
					},
					{
						id: "01H7WY5C35TRFZJ00YK92QM2Y2",
						selector: ".aspect-9-16",
						declarations: [
							{
								property: "aspect-ratio",
								value: "9 / 16",
								fluidValue: [0, 0, "px"],
								id: "01H7WY3AEA76CPM0M91AXND6HM",
							},
						],
					},
				],
			},
			{
				id: "01GTC81PH3BQZJZQZQZQZQZQZQ",
				name: "Image Fit",
				cssObjects: [
					{
						id: "01GTC835SR8VQM3XDEM2KVA3JV",
						selector: ".fit-contain",
						declarations: [
							{
								property: "object-fit",
								value: "contain",
								fluidValue: [0, 0, "px"],
								id: "01GTC835SR6NV2154ACDSAKV39",
							},
						],
					},
					{
						id: "01GTC81PH37S1AKT0KSSGV0522",
						selector: ".fit-cover",
						declarations: [
							{
								property: "object-fit",
								value: "cover",
								fluidValue: [0, 0, "px"],
								id: "01GTC81PH3750D27VNCK4C1GM6",
							},
						],
					},
					{
						id: "01GTC82RAS8AQF2D996KASE2DR",
						selector: ".fit-fill",
						declarations: [
							{
								property: "object-fit",
								value: "fill",
								fluidValue: [0, 0, "px"],
								id: "01GTC82RAS800CG2D2QR33PWKW",
							},
						],
					},
				],
			},
			{
				id: "01H4DW9YXSJNVK3GSDMM5HRR5E",
				name: "Backdrop Blur",
				cssObjects: [
					{
						id: "01H4DW9YXSYT01H80SJ3618NEB",
						selector: ".bg-blur-xs",
						declarations: [
							{
								property: "backdrop-filter",
								value: "blur(2px)",
								fluidValue: [0, 0, "px"],
								id: "01H4DW9YXSNC4NF5FCAMAHS86W",
							},
						],
					},
					{
						id: "01H4DWB751XR6Z7R2ZW25YJYWH",
						selector: ".bg-blur-s",
						declarations: [
							{
								property: "backdrop-filter",
								value: "blur(4px)",
								fluidValue: [0, 0, "px"],
								id: "01H4DW9YXSNC4NF5FCAMAHS86W",
							},
						],
					},
					{
						id: "01H4DWBAQQNASBVQ2G2S0R82HA",
						selector: ".bg-blur-m",
						declarations: [
							{
								property: "backdrop-filter",
								value: "blur(8px)",
								fluidValue: [0, 0, "px"],
								id: "01H4DW9YXSNC4NF5FCAMAHS86W",
							},
						],
					},
					{
						id: "01H4DWBF736YT0CNT8PVHK88K9",
						selector: ".bg-blur-l",
						declarations: [
							{
								property: "backdrop-filter",
								value: "blur(16px)",
								fluidValue: [0, 0, "px"],
								id: "01H4DW9YXSNC4NF5FCAMAHS86W",
							},
						],
					},
					{
						id: "01H4DWBGV48516D4QP31X38GNW",
						selector: ".bg-blur-xl",
						declarations: [
							{
								property: "backdrop-filter",
								value: "blur(32px)",
								fluidValue: [0, 0, "px"],
								id: "01H4DW9YXSNC4NF5FCAMAHS86W",
							},
						],
					},
				],
			},
			{
				id: "01H4DWCE28P85C64J3GR1GJDNN",
				name: "Filters",
				cssObjects: [
					{
						id: "01H4DWCE28MD5AETW3WXYCC48G",
						selector: ".grayscale",
						declarations: [
							{
								property: "filter",
								value: "grayscale(1)",
								fluidValue: [0, 0, "px"],
								id: "01H4DWCE289D91ZE6CNBSMTBAQ",
							},
						],
					},
				],
			},
			{
				id: "01H5YVP21Z5EJEWC3Y9HTJFF4T",
				name: "Transforms",
				cssObjects: [
					{
						id: "01H5YVQHZ7W77AKZP6B8R1J9Q7",
						selector: ".rotate-90",
						declarations: [
							{
								property: "transform",
								value: "rotate(90deg)",
								fluidValue: [0, 0, "px"],
								id: "01H5YVP21Z3X5PGZR63EHZ3NPN",
							},
						],
					},
					{
						id: "01H5YVQRYHD6W923WB02FH98EH",
						selector: ".rotate-180",
						declarations: [
							{
								property: "transform",
								value: "rotate(180deg)",
								fluidValue: [0, 0, "px"],
								id: "01H5YVP21Z3X5PGZR63EHZ3NPN",
							},
						],
					},
				],
			},
		],
		componentsStyles: [],
		otherStyles: [
			{
				id: "3434",
				name: "Utilities",
				cssObjects: [
					{
						id: "01H7WYME9CGDY5VS932PVT6TMT",
						selector: ".display-none",
						declarations: [
							{
								property: "display",
								value: "none",
								fluidValue: [0, 0, "px"],
								id: "01H7WYME9C9SF8FDSMMDGV774X",
							},
						],
					},
					{
						id: "01H7WYKMB3BRVQGMAJC88XPJ7C",
						selector: ".visible",
						declarations: [
							{
								property: "visibility",
								value: "visible",
								fluidValue: [0, 0, "px"],
								id: "01H7WYKMB3MXMGYSNFFVFA85JT",
							},
						],
					},
					{
						id: "01H7WYKXYWS0AB6QNS6YGW0S8J",
						selector: ".hidden",
						declarations: [
							{
								property: "visibility",
								value: "hidden",
								fluidValue: [0, 0, "px"],
								id: "01H7WYKMB3MXMGYSNFFVFA85JT",
							},
						],
					},
					{
						id: "01GXDTG3XQ0WCV9F7NXCT6X7KM",
						selector: ".overflow-hidden",
						declarations: [
							{
								property: "overflow",
								value: "hidden",
								fluidValue: [0, 0, "px"],
								id: "01GXDTG3XRM3FPMGK8G51BE666",
							},
						],
					},
					{
						id: "01H5YV0Y05CV2PKWPMB326TGDN",
						selector: ".overflow-auto",
						declarations: [
							{
								property: "overflow",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXDTG3XRM3FPMGK8G51BE666",
							},
						],
					},
					{
						id: "01H5YTZ7EZ129NMAT0TF8MHJST",
						selector: ".overflow-x-hidden",
						declarations: [
							{
								property: "overflow-x",
								value: "hidden",
								fluidValue: [0, 0, "px"],
								id: "01GXDTG3XRM3FPMGK8G51BE666",
							},
						],
					},
					{
						id: "01H5YTZF568GEXYKN8A2RKHR89",
						selector: ".overflow-x-auto",
						declarations: [
							{
								property: "overflow-x",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXDTG3XRM3FPMGK8G51BE666",
							},
						],
					},
					{
						id: "01H5YTZBA6CKQDXEDB4BFHMEN3",
						selector: ".overflow-y-hidden",
						declarations: [
							{
								property: "overflow-y",
								value: "hidden",
								fluidValue: [0, 0, "px"],
								id: "01GXDTG3XRM3FPMGK8G51BE666",
							},
						],
					},
					{
						id: "01H5YTZNEY9C4MK464QJHAYY1B",
						selector: ".overflow-y-auto",
						declarations: [
							{
								property: "overflow-y",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01GXDTG3XRM3FPMGK8G51BE666",
							},
						],
					},
					{
						id: "01GXVW38JZ3A33WQ2VEW8SZEQ9",
						selector: ".list-none",
						declarations: [
							{
								property: "list-style-type",
								value: "none",
								fluidValue: [0, 0, "px"],
								id: "01GXVW38JZD6JS24HRXXD5HZ5J",
							},
						],
					},
					{
						id: "01GXX7QCGJTYGSXXKE471ERGG9",
						selector: ".white-space-nowrap",
						declarations: [
							{
								property: "white-space",
								value: "nowrap",
								fluidValue: [0, 0, "px"],
								id: "01GXX7QCGJ1HPVJ84BZ7C9R32R",
							},
						],
					},
					{
						id: "01GXVW4CWNWMM4TPFW2TPQNN9B",
						selector: ".transition-global",
						declarations: [
							{
								property: "transition",
								value: "all 0.3s",
								fluidValue: [0, 0, "px"],
								id: "01GXVW4CWN0S0C9J8ZWP9M503Q",
							},
						],
					},
				],
			},
			{
				id: "01H2D9KWFXXJY6DCES28TMV19D",
				name: "Positioning",
				cssObjects: [
					{
						id: "01H2D9ME4J51F4AVDMEZZ1GVXB",
						selector: ".relative",
						declarations: [
							{
								property: "position",
								value: "relative",
								fluidValue: [0, 0, "px"],
								id: "01H2D9ME4K6PD2FHB0BK4YDBCP",
							},
						],
					},
					{
						id: "01H2D9KWFXZ7AM4ZYJE2SH955Q",
						selector: ".absolute",
						declarations: [
							{
								property: "position",
								value: "absolute",
								fluidValue: [0, 0, "px"],
								id: "01H2D9KWFXVCRSSW0F29QH5QP3",
							},
						],
					},
					{
						id: "01H7WSX2WJVNYT812135KVJ0CF",
						selector: ".sticky",
						declarations: [
							{
								property: "position",
								value: "sticky",
								fluidValue: [0, 0, "px"],
								id: "01H7WSX2WJ0DD9T8R3HGKWYF8S",
							},
						],
					},
					{
						id: "01H7WSXF3JX4NSEYTGWB7J878A",
						selector: ".fixed",
						declarations: [
							{
								property: "position",
								value: "fixed",
								fluidValue: [0, 0, "px"],
								id: "01H7WSXF3JJ1VM9WBQ1AWRM1H3",
							},
						],
					},
					{
						id: "01H2D9MQSJXWJC8FW5JTPSKWEY",
						selector: ".inset-0",
						declarations: [
							{
								property: "inset",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01H2D9MQSJSHDRRMJSJ53XH96X",
							},
						],
					},
					{
						id: "01H2D9N33QAGEPRZ5S3XKTMZFM",
						selector: ".bottom-0",
						declarations: [
							{
								property: "bottom",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01H2D9N33Q0D63XHG0NF66TT8F",
							},
						],
					},
					{
						id: "01H2D9NEP0HGJ13E0TJNSNAJQ0",
						selector: ".top-0",
						declarations: [
							{
								property: "top",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01H2D9NEP0NHAQ6RGM76W5CVGA",
							},
						],
					},
					{
						id: "01H2D9NP8S833WEX69E48B6QA6",
						selector: ".left-0",
						declarations: [
							{
								property: "left",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01H2D9NP8SJR5ANDW9TRXP131E",
							},
						],
					},
					{
						id: "01H2D9NZFWMG1WZ0Z4N3CFF4WS",
						selector: ".right-0",
						declarations: [
							{
								property: "right",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01H2D9NZFWWG38054RRHWQHTMM",
							},
						],
					},
				],
			},
			{
				id: "01H4DWGP1GVW1B1J0H38E9FHK9",
				name: "Cursors",
				cssObjects: [
					{
						id: "01H4DWGP1H074ZZBYQX1MSHCMQ",
						selector: ".pointer",
						declarations: [
							{
								property: "cursor",
								value: "pointer",
								fluidValue: [0, 0, "px"],
								id: "01H4DWGP1HW4R2GW6V77J52KGC",
							},
						],
					},
					{
						id: "01H4DWHGWGMF8CF6P09N0G6JY7",
						selector: ".not-allowed",
						declarations: [
							{
								property: "cursor",
								value: "not-allowed",
								fluidValue: [0, 0, "px"],
								id: "01H4DWGP1HW4R2GW6V77J52KGC",
							},
						],
					},
					{
						id: "01H4DWHSJ1EYZ2RVWV69YGX3AJ",
						selector: ".cursor-auto",
						declarations: [
							{
								property: "cursor",
								value: "auto",
								fluidValue: [0, 0, "px"],
								id: "01H4DWGP1HW4R2GW6V77J52KGC",
							},
						],
					},
					{
						id: "01H4DWMAMNZJK5YK15T4WB21FF",
						selector: ".no-pointer-events",
						declarations: [
							{
								property: "pointer-events",
								value: "none",
								fluidValue: [0, 0, "px"],
								id: "01H4DWMAMNCC8Z4K7J5NME4GDT",
							},
						],
					},
				],
			},
			{
				id: "01H6BY3K69N4YVWBGV2B7CZQ0Q",
				name: "Z-Index",
				cssObjects: [
					{
						id: "01H6BY3K6AP7EBRYDF7TR8RNWV",
						selector: ".z--1",
						declarations: [
							{
								property: "z-index",
								value: "-1",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
					{
						id: "01H6BY4HGAX9VTJWH5DGANVZKZ",
						selector: ".z-0",
						declarations: [
							{
								property: "z-index",
								value: "0",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
					{
						id: "01H6BY4YFS1R0TC7371S8P88SV",
						selector: ".z-1",
						declarations: [
							{
								property: "z-index",
								value: "1",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
					{
						id: "01H6BY4X2FWBF8TV3N1FE80RQE",
						selector: ".z-10",
						declarations: [
							{
								property: "z-index",
								value: "10",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
					{
						id: "01H6BY4VHJMHGBFZYCBFQXZZ8M",
						selector: ".z-100",
						declarations: [
							{
								property: "z-index",
								value: "100",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
					{
						id: "01H6BY4SCNXA4QA8QCBZ1QBD0P",
						selector: ".z-1000",
						declarations: [
							{
								property: "z-index",
								value: "1000",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
					{
						id: "01H6BY5A0X91TPTRBS15R2MV6S",
						selector: ".z-10000",
						declarations: [
							{
								property: "z-index",
								value: "10000",
								fluidValue: [0, 0, "px"],
								id: "01H6BY3K6AFPB4X09832MBXKMN",
							},
						],
					},
				],
			},
		],
	},
	modulesData: {
		FLUID_TYPOGRAPHY: TYPOGRAPHY_INITIAL_STATE,
		COLOR_SYSTEM: COLOR_SYSTEM_INITIAL_STATE,
		FLUID_SPACING: SPACING_CALCULATOR_INITIAL_STATE,
		COMPONENTS: COMPONENTS_INITIAL_STATE,
		FONTS: { fonts: [] },
	},
	has_updated_columns: true,
};

export const getBlankPreset = (): Preset => {
	const preset = clearPresetData(DEFAULT_PRESET);
	preset.name = "Blank";
	return preset;
};

export const getMinimalPreset = (): Preset => {
	let preset: Preset | null;

	try {
		preset = structuredClone(DEFAULT_PRESET);
	} catch (e) {
		preset = { ...DEFAULT_PRESET };
	}

	preset = {
		...preset,
		styleSheetData: {
			...preset.styleSheetData,
			colorStyles: preset.styleSheetData?.colorStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			componentsStyles: preset.styleSheetData?.componentsStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			designStyles: preset.styleSheetData?.designStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			layoutsStyles: preset.styleSheetData?.layoutsStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			otherStyles: preset.styleSheetData?.otherStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			spacingStyles: preset.styleSheetData?.spacingStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			typographyStyles: preset.styleSheetData?.typographyStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
			fontsStyles: preset.styleSheetData?.fontsStyles?.map((group) => ({
				...group,
				isDisabled: group?.type !== "variable",
			})),
		},
	};

	preset = {
		...preset,
		modulesData: {
			...preset.modulesData,
			COLOR_SYSTEM: {
				...preset.modulesData?.COLOR_SYSTEM,
				groups: preset.modulesData?.COLOR_SYSTEM?.groups?.map((group) => ({
					...group,
					colors: group.colors.map((color) => ({
						...color,
						gen: [],
					})),
				}))!,
			},
			FLUID_TYPOGRAPHY: {
				...preset.modulesData?.FLUID_TYPOGRAPHY,
				groups: preset.modulesData?.FLUID_TYPOGRAPHY?.groups?.map((group) => ({
					...group,
				}))!,
				classes: preset.modulesData?.FLUID_TYPOGRAPHY?.classes?.map((item) => ({
					...item,
					isDisabled: true,
				}))!,
			},
			FLUID_SPACING: {
				...preset.modulesData?.FLUID_SPACING!,
				groups: preset.modulesData?.FLUID_SPACING?.groups?.map((group) => ({
					...group,
				}))!,
				classes: preset.modulesData?.FLUID_SPACING?.classes?.map((item) => ({
					...item,
					isDisabled: true,
				}))!,
			},
			COMPONENTS: {
				...preset.modulesData?.COMPONENTS!,
				isDisabled: true,
			},
			FONTS: {
				...preset.modulesData?.FONTS!,
				isDisabled: true,
			},
		},
	};

	preset.name = "Minimal";

	return preset;
};
