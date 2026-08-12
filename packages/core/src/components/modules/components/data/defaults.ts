import type { Component, ComponentData, DeclarationsWithState } from "../types";
import { ulid } from "ulid";
import { getEmptyDeclaration } from "utils";
import { DEFAULT_COMPONENTS_STATE } from "./constants";

export const DEFAULT_DECLARATIONS: DeclarationsWithState = {
	default: [getEmptyDeclaration()],
};

export const DEFAULT_SELECTOR = ".btn-primary" as const;

export const DEFAULT_COMPONENT: Component = {
	id: "7",
	selector: ".btn-primary",
	type: "button",
	variants: [
		{
			id: ulid(),
			type: DEFAULT_COMPONENTS_STATE,
			declarations: [
				{
					id: "1",
					property: "",
					value: "",
				},
			],
		},
	],
};

export const COMPONENTS_INITIAL_STATE: ComponentData = {
	components: [
		{
			id: "13",
			selector: ".btn",
			type: "button",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "display",
							value: "flex",
							fluidValue: [0, 0, "px"],
							id: "01GXK889W5DSJFR4GXE2AKV5B8",
						},
						{
							property: "align-items",
							value: "center",
							fluidValue: [0, 0, "px"],
							id: "01GXK88EQ2PNM94ZPJ693SKZAV",
						},
						{
							property: "justify-content",
							value: "center",
							fluidValue: [0, 0, "px"],
							id: "01GXS4P4RHQX31G5JDC5K5YMDV",
						},
						{
							property: "gap",
							value: "var(--space-3xs)",
							fluidValue: [0, 0, "px"],
							id: "01H2AN4ZZ15T716YA3K32CR3MH",
						},
						{
							property: "padding",
							value: "var(--space-xs) var(--space-s)",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "background",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "3",
						},
						{
							property: "color",
							value: "#fff",
							fluidValue: [0, 0, "px"],
							id: "4",
						},
						{
							property: "font-size",
							value: "var(--text-m)",
							fluidValue: [0, 0, "px"],
							id: "6",
						},
						{
							property: "font-weight",
							value: "600",
							fluidValue: [0, 0, "px"],
							id: "7",
						},
						{
							property: "border-radius",
							value: "var(--radius-m)",
							fluidValue: [0, 0, "px"],
							id: "2",
						},
						{
							property: "border",
							value: "1px solid var(--primary-d-1)",
							fluidValue: [0, 0, "px"],
							id: "01GXVXT6T00NVQ3WX41QKNAH4K",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-m)",
							fluidValue: [0, 0, "px"],
							id: "01H7XPQAXZ5FGTPA4YM3WZHD2M",
						},
						{
							property: "transition",
							value: "all 0.25s ease-in-out",
							fluidValue: [0, 0, "px"],
							id: "5",
						},
						{
							property: "outline",
							value: "0",
							fluidValue: [0, 0, "px"],
							id: "01GXVY3A0ZG5GEHB3NW6XW7M9E",
						},
						{
							property: "cursor",
							value: "pointer",
							fluidValue: [0, 0, "px"],
							id: "01H6BANDB71EQ76HQZS4ZH09VW",
						},
					],
				},
				{
					id: "1",
					type: "hover",
					parentId: "default",
					declarations: [
						{
							property: "background",
							value: "var(--primary-d-1)",
							fluidValue: [0, 0, "px"],
							id: "0",
						},
						{
							property: "transform",
							value: "translateY(-0.1rem)",
							fluidValue: [0, 0, "px"],
							id: "2",
						},
					],
				},
				{
					id: "2",
					type: "variant",
					parentId: "default",
					variantSelector: ".small",
					declarations: [
						{
							property: "font-size",
							value: "var(--text-s)",
							fluidValue: [0, 0, "px"],
							id: "01H03MMGG4K9E5DSXDRG9MKNJ9",
						},
						{
							property: "padding",
							value: "var(--space-xs) var(--space-s)",
							fluidValue: [0, 0, "px"],
							id: "01H03MNZCQS0PQBYV6XYJNH03E",
						},
					],
				},
				{
					id: "3",
					type: "variant",
					parentId: "default",
					variantSelector: ".large",
					declarations: [
						{
							property: "font-size",
							value: "var(--text-l)",
							fluidValue: [0, 0, "px"],
							id: "01H03MPW3N1050D9AZE17A5BPC",
						},
						{
							property: "padding",
							value: "var(--space-s) var(--space-m)",
							fluidValue: [0, 0, "px"],
							id: "01H03MPKZSGRNJC3591FTWYT5A",
						},
					],
				},
				{
					id: "4",
					type: "variant",
					parentId: "default",
					variantSelector: ".tertiary",
					declarations: [
						{
							property: "background",
							value: "var(--tertiary)",
							fluidValue: [0, 0, "px"],
							id: "01H2AN6VQWY6W35R81S8PS5G6K",
						},
						{
							property: "border-color",
							value: "var(--tertiary-d-1)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ8FMBDKNDQ36EJYJY82DE",
						},
					],
				},
				{
					id: "5",
					type: "variant",
					parentId: "default",
					variantSelector: ".ghost",
					declarations: [
						{
							property: "color",
							value: "var(--dark-80)",
							fluidValue: [0, 0, "px"],
							id: "01H2AZSA9S6Z6P66393MJP8D7C",
						},
						{
							property: "background",
							value: "transparent",
							fluidValue: [0, 0, "px"],
							id: "01H2ANCYYD5094EY54FE8WA0PJ",
						},
						{
							property: "border-color",
							value: "transparent",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ0J706724JARPFC19RTJH",
						},
						{
							property: "box-shadow",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ0VFG265Q39E88QHYCTKD",
						},
					],
				},
				{
					id: "6",
					type: "variant",
					parentId: "default",
					variantSelector: ".slight",
					declarations: [
						{
							property: "color",
							value: "var(--dark-80)",
							fluidValue: [0, 0, "px"],
							id: "01H7XPTQTY0MHB4G23C4S68CSY",
						},
						{
							property: "background",
							value: "var(--bg-surface)",
							fluidValue: [0, 0, "px"],
							id: "01H2AN0EGN5CD2A0R65PK0D3YP",
						},
						{
							property: "border-color",
							value: "var(--border-primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XPWCRH6GN1NSN6064FHM32",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-s)",
							fluidValue: [0, 0, "px"],
							id: "01H7XPY7G6VDV83NG95HXB3EA2",
						},
					],
				},
				{
					id: "7",
					type: "variant",
					parentId: "default",
					variantSelector: ".secondary",
					declarations: [
						{
							property: "background",
							value: "var(--secondary)",
							fluidValue: [0, 0, "px"],
							id: "01H2EM0TBH1T9NE2RG2A2FYDP1",
						},
						{
							property: "border-color",
							value: "var(--secondary-d-1)",
							fluidValue: [0, 0, "px"],
							id: "01H7XPT2NPK15ZKQR6T44GDTDD",
						},
					],
				},
				{
					id: "hover-9",
					type: "hover",
					parentId: "5",
					declarations: [
						{
							property: "background",
							value: "var(--dark-10)",
							fluidValue: [0, 0, "px"],
							id: "01H4DTNRBZK42WBS6PHF1V3721",
						},
					],
				},
				{
					id: "hover-10",
					type: "hover",
					parentId: "6",
					declarations: [
						{
							property: "background",
							value: "var(--dark-5)",
							fluidValue: [0, 0, "px"],
							id: "01H4DTQ00D8GS0EKPXYCS67PDC",
						},
					],
				},
				{
					id: "hover-11",
					type: "hover",
					parentId: "4",
					declarations: [
						{
							property: "background",
							value: "var(--tertiary-d-1)",
							fluidValue: [0, 0, "px"],
							id: "01H4DTQDEFKWP5YXADVZYH00NE",
						},
					],
				},
				{
					id: "hover-12",
					type: "hover",
					parentId: "7",
					declarations: [
						{
							property: "background",
							value: "var(--secondary-d-1)",
							fluidValue: [0, 0, "px"],
							id: "01H4DTRBYQXAZKHEVQTMN8CHPX",
						},
					],
				},
				{
					id: "focus-13",
					type: "focus",
					parentId: "default",
					declarations: [
						{
							property: "outline",
							value: "4px solid var(--primary-l-3)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ5EAYQ8ZSFC0W8CC23GRP",
						},
						{
							property: "outline-offset",
							value: "2px",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ5YYM4A5BZWEFTX2W7C1Z",
						},
					],
				},
				{
					id: "variant-18",
					type: "variant",
					parentId: "default",
					variantSelector: ".no-bg",
					declarations: [
						{
							property: "color",
							value: "var(--dark-80)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ3RR0A7H54MQFGJFZ9R3E",
						},
						{
							property: "background",
							value: "transparent",
							fluidValue: [0, 0, "px"],
							id: "01H6BYF73VBZY1K4GWHGMEE0MD",
						},
						{
							property: "box-shadow",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ38GAGAAV9QYDAMATM1ZD",
						},
						{
							property: "border-color",
							value: "transparent",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ3J34EYZWMEM4D9K8NPCD",
						},
					],
				},
				{
					id: "hover-19",
					type: "hover",
					parentId: "variant-18",
					declarations: [
						{
							property: "color",
							value: "var(--dark)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQ42WKZWYX3GCMJVNCCQK2",
						},
					],
				},
			],
			order: ["default", "2", "3", "7", "4", "6", "5", "variant-18"],
		},
		{
			id: "28",
			selector: ".badge",
			type: "button",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "display",
							value: "flex",
							fluidValue: [0, 0, "px"],
							id: "01GXK889W5DSJFR4GXE2AKV5B8",
						},
						{
							property: "align-items",
							value: "center",
							fluidValue: [0, 0, "px"],
							id: "01GXK88EQ2PNM94ZPJ693SKZAV",
						},
						{
							property: "justify-content",
							value: "center",
							fluidValue: [0, 0, "px"],
							id: "01GXS4P4RHQX31G5JDC5K5YMDV",
						},
						{
							property: "gap",
							value: "var(--space-4xs)",
							fluidValue: [0, 0, "px"],
							id: "01H2EB9XPZCAP2YGT1G74VX6AD",
						},
						{
							property: "padding",
							value: "var(--space-2xs) var(--space-s)",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "background",
							value: "var(--dark-10)",
							fluidValue: [0, 0, "px"],
							id: "01H2C16FHYMC537KF3QCT13ZNG",
						},
						{
							property: "color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "4",
						},
						{
							property: "font-size",
							value: "var(--text-s)",
							fluidValue: [0, 0, "px"],
							id: "6",
						},
						{
							property: "font-weight",
							value: "500",
							fluidValue: [0, 0, "px"],
							id: "7",
						},
						{
							property: "border-radius",
							value: "var(--radius-full)",
							fluidValue: [0, 0, "px"],
							id: "2",
						},
						{
							property: "border",
							value: "0",
							fluidValue: [0, 0, "px"],
							id: "01GXVXT6T00NVQ3WX41QKNAH4K",
						},
						{
							property: "outline",
							value: "0",
							fluidValue: [0, 0, "px"],
							id: "01GXVY3A0ZG5GEHB3NW6XW7M9E",
						},
					],
				},
				{
					id: "2",
					type: "variant",
					parentId: "default",
					variantSelector: ".secondary",
					declarations: [
						{
							property: "color",
							value: "var(--secondary)",
							fluidValue: [0, 0, "px"],
							id: "01H2C1J84K8X82MG40126XNKSM",
						},
					],
				},
			],
			order: ["default", "1", "2", "01H7XH8HEJ7YMASS4HDKB3NEWZ"],
		},
		{
			id: "23",
			selector: ".link",
			type: "link",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "2",
						},
						{
							property: "font-size",
							value: "var(--text-m)",
							fluidValue: [0, 0, "px"],
							id: "01H03M629TXYSC75J90PC06DWG",
						},
						{
							property: "font-weight",
							value: "600",
							fluidValue: [0, 0, "px"],
							id: "01H03M4B8XRXF6C339S4S64RQP",
						},
						{
							property: "letter-spacing",
							value: "0.05rem",
							fluidValue: [0, 0, "px"],
							id: "01H7XHBZ8JD2AJM3YHS733JXGJ",
						},
						{
							property: "box-shadow",
							value: "0 2px 0 var(--primary-20)",
							fluidValue: [0, 0, "px"],
							id: "01H03M16Z7Y5R90FS0TGZ53WRF",
						},
						{
							property: "text-decoration",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "01H03KVWXRH9MP5PV9S4GBW8SP",
						},
						{
							property: "transition",
							value: "all 0.15s ease-in-out",
							fluidValue: [0, 0, "px"],
							id: "7",
						},
					],
				},
				{
					id: "1",
					type: "hover",
					parentId: "default",
					declarations: [
						{
							property: "box-shadow",
							value: "0 2px 0 var(--primary-40)",
							fluidValue: [0, 0, "px"],
							id: "01H03KX5FRKWRN14H9NYFPJ69X",
						},
					],
				},
				{
					id: "2",
					type: "focus",
					parentId: "default",
					declarations: [
						{
							property: "background",
							value: "var(--primary-10)",
							fluidValue: [0, 0, "px"],
							id: "01H7XHDXBGYPXF7NAWGJRAFRXK",
						},
					],
				},
				{
					id: "variant-4",
					type: "variant",
					parentId: "default",
					variantSelector: ".secondary",
					declarations: [
						{
							property: "color",
							value: "var(--secondary)",
							fluidValue: [0, 0, "px"],
							id: "01H4DYME2HQDM3M34K59B6Z62R",
						},
						{
							property: "border-color",
							value: "var(--secondary-20)",
							fluidValue: [0, 0, "px"],
							id: "01H4DYNCES0ENDHQ47Z5H5E58M",
						},
					],
				},
				{
					id: "variant-5",
					type: "variant",
					parentId: "default",
					variantSelector: ".tertiary",
					declarations: [
						{
							property: "color",
							value: "var(--tertiary)",
							fluidValue: [0, 0, "px"],
							id: "01H4DYRDD5HRFF0ABRAW1JSHX1",
						},
						{
							property: "border-color",
							value: "var(--tertiary-20)",
							fluidValue: [0, 0, "px"],
							id: "01H4DYRVBJ8VPHVWCDGBFK3S7N",
						},
					],
				},
			],
			order: ["default", "variant-4", "variant-5"],
		},
		{
			id: "12",
			selector: ".input",
			type: "input",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "padding",
							value: "var(--space-xs) var(--space-s)",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "background",
							value: "var(--dark-5)",
							fluidValue: [0, 0, "px"],
							id: "01H03JQG1QV6WDF0NJK9T9KK07",
						},
						{
							property: "color",
							value: "var(--text-title)",
							fluidValue: [0, 0, "px"],
							id: "5",
						},
						{
							property: "font-size",
							value: "var(--text-m)",
							fluidValue: [0, 0, "px"],
							id: "01GXK847GBE4GBTSH4P0ATTY9P",
						},
						{
							property: "font-weight",
							value: "500",
							fluidValue: [0, 0, "px"],
							id: "01H7XNJ43DQQQHHK9XP2GTRNAX",
						},
						{
							property: "border-radius",
							value: "var(--radius-m)",
							fluidValue: [0, 0, "px"],
							id: "2",
						},
						{
							property: "border",
							value: "1px solid var(--border-primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XN4P0BGXGMJ8CZE3RHGMC9",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-xs)",
							fluidValue: [0, 0, "px"],
							id: "01H7XN5439B19YAVG2XZ2FC8X2",
						},
						{
							property: "transition",
							value: "all 0.25s ease-in-out",
							fluidValue: [0, 0, "px"],
							id: "01GXVZ9X2B6W610V0CZS67AAKD",
						},
						{
							property: "appearance",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "01GXX7PQPJV3MPKW4JZY39EQ46",
						},
						{
							property: "outline",
							value: "0",
							fluidValue: [0, 0, "px"],
							id: "01GXVZ38HPFY662JV1MG43SMJ8",
						},
					],
				},
				{
					id: "1",
					type: "focus",
					parentId: "default",
					declarations: [
						{
							property: "background",
							value: "var(--primary-20)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQHQPY99R3PY05W2W7YTGG",
						},
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQJ3DH5E5GXQ5J2693EHXX",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-l)",
							fluidValue: [0, 0, "px"],
							id: "01H7YV3DZBPZ3WB3VMDP6BC6MZ",
						},
					],
				},
				{
					id: "2",
					type: "hover",
					parentId: "default",
					declarations: [
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01GZ1HVZ6JKR6F79BJXFKCABF7",
						},
						{
							property: "background",
							value: "transparent",
							fluidValue: [0, 0, "px"],
							id: "01H7YTYXH3VRS2BP7AV87WJ7B6",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-l)",
							fluidValue: [0, 0, "px"],
							id: "01H7YV2KNNPRGMDS1RFM2RD3HJ",
						},
					],
				},
				{
					id: "variant-4",
					type: "variant",
					parentId: "default",
					variantSelector: "::placeholder",
					declarations: [
						{
							property: "color",
							value: "var(--dark-40)",
							fluidValue: [0, 0, "px"],
							id: "01H7TF2XBN7YD98SFWWWXBD0TS",
						},
					],
				},
				{
					id: "invalid-7",
					type: "invalid",
					parentId: "default",
					declarations: [
						{
							property: "border-color",
							value: "var(--error)",
							fluidValue: [0, 0, "px"],
							id: "01H7XNY2GSHT2C3GS5WA4X1H72",
						},
						{
							property: "background",
							value: "var(--error-10)",
							fluidValue: [0, 0, "px"],
							id: "01H7XP92AX805YWHBK4P6098GA",
						},
					],
				},
				{
					id: "disabled-7",
					type: "disabled",
					parentId: "default",
					declarations: [
						{
							property: "cursor",
							value: "not-allowed",
							fluidValue: [0, 0, "px"],
							id: "01H7XP6JMC0THC1CNJTC1NW0SV",
						},
						{
							property: "opacity",
							value: ".75",
							fluidValue: [0, 0, "px"],
							id: "01H7XP6Y3XYBCFG6WD85MPXD69",
						},
						{
							property: "box-shadow",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "01H7XP7R5NQ23NZE3P8HBX1K4W",
						},
						{
							property: "background",
							value: "var(--dark-10)",
							fluidValue: [0, 0, "px"],
							id: "01H7XP88NKBDG7QT8QN3P7BAMH",
						},
					],
				},
			],
			order: [
				"default",
				"3",
				"variant-4",
				"variant-4",
				"variant-4",
				"variant-5",
				"01H7XNWME9ZJA7PPD8XARCF0BZ",
			],
		},
		{
			id: "30",
			selector: ".select",
			type: "select",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "padding",
							value: "var(--space-xs) var(--space-s)",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "background",
							value: "var(--dark-5)",
							fluidValue: [0, 0, "px"],
							id: "01H03JQG1QV6WDF0NJK9T9KK07",
						},
						{
							property: "color",
							value: "var(--text-body)",
							fluidValue: [0, 0, "px"],
							id: "5",
						},
						{
							property: "font-size",
							value: "var(--text-m)",
							fluidValue: [0, 0, "px"],
							id: "01GXK847GBE4GBTSH4P0ATTY9P",
						},
						{
							property: "font-weight",
							value: "500",
							fluidValue: [0, 0, "px"],
							id: "01H7XNJ43DQQQHHK9XP2GTRNAX",
						},
						{
							property: "border-radius",
							value: "var(--radius-m)",
							fluidValue: [0, 0, "px"],
							id: "2",
						},
						{
							property: "border",
							value: "1px solid var(--border-primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XN4P0BGXGMJ8CZE3RHGMC9",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-xs)",
							fluidValue: [0, 0, "px"],
							id: "01H7XN5439B19YAVG2XZ2FC8X2",
						},
						{
							property: "transition",
							value: "all 0.25s ease-in-out",
							fluidValue: [0, 0, "px"],
							id: "01GXVZ9X2B6W610V0CZS67AAKD",
						},
						{
							property: "outline",
							value: "0",
							fluidValue: [0, 0, "px"],
							id: "01GXVZ38HPFY662JV1MG43SMJ8",
						},
					],
				},
				{
					id: "1",
					type: "focus",
					parentId: "default",
					declarations: [
						{
							property: "background",
							value: "var(--primary-20)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQHQPY99R3PY05W2W7YTGG",
						},
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XQJ3DH5E5GXQ5J2693EHXX",
						},
					],
				},
				{
					id: "2",
					type: "hover",
					parentId: "default",
					declarations: [
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01GZ1HVZ6JKR6F79BJXFKCABF7",
						},
					],
				},
				{
					id: "variant-4",
					type: "variant",
					parentId: "default",
					variantSelector: "::placeholder",
					declarations: [
						{
							property: "color",
							value: "var(--dark-40)",
							fluidValue: [0, 0, "px"],
							id: "01H7TF2XBN7YD98SFWWWXBD0TS",
						},
					],
				},
				{
					id: "invalid-7",
					type: "invalid",
					parentId: "default",
					declarations: [
						{
							property: "border-color",
							value: "var(--error)",
							fluidValue: [0, 0, "px"],
							id: "01H7XNY2GSHT2C3GS5WA4X1H72",
						},
						{
							property: "background",
							value: "var(--error-10)",
							fluidValue: [0, 0, "px"],
							id: "01H7XP92AX805YWHBK4P6098GA",
						},
					],
				},
				{
					id: "disabled-7",
					type: "disabled",
					parentId: "default",
					declarations: [
						{
							property: "cursor",
							value: "not-allowed",
							fluidValue: [0, 0, "px"],
							id: "01H7XP6JMC0THC1CNJTC1NW0SV",
						},
						{
							property: "opacity",
							value: ".75",
							fluidValue: [0, 0, "px"],
							id: "01H7XP6Y3XYBCFG6WD85MPXD69",
						},
						{
							property: "box-shadow",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "01H7XP7R5NQ23NZE3P8HBX1K4W",
						},
						{
							property: "background",
							value: "var(--dark-10)",
							fluidValue: [0, 0, "px"],
							id: "01H7XP88NKBDG7QT8QN3P7BAMH",
						},
					],
				},
			],
			order: [
				"default",
				"3",
				"variant-4",
				"variant-4",
				"variant-4",
				"variant-5",
				"01H7XNWME9ZJA7PPD8XARCF0BZ",
			],
		},
		{
			id: "26",
			selector: ".card",
			type: "card",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "display",
							value: "grid",
							fluidValue: [0, 0, "px"],
							id: "01H03NDTT4CMH6MWAR36E40KXK",
						},
						{
							property: "gap",
							value: "var(--space-xs)",
							fluidValue: [0, 0, "px"],
							id: "01H05KSB2EF6TCZZBEPEFD4162",
						},
						{
							property: "padding",
							value: "var(--space-m)",
							fluidValue: [0, 0, "px"],
							id: "5",
						},
						{
							property: "font-size",
							value: "var(--text-m)",
							fluidValue: [0, 0, "px"],
							id: "01H05KSXJ1EZ1TTDK8KSX39GGV",
						},
						{
							property: "color",
							value: "var(--text-body)",
							fluidValue: [0, 0, "px"],
							id: "01H05KWE2EMWWNF4JYP09E8VM8",
						},
						{
							property: "background",
							value: "var(--bg-surface)",
							fluidValue: [0, 0, "px"],
							id: "01H03NCMZK4KCFWGF9G075X8W4",
						},
						{
							property: "line-height",
							value: "1.3",
							fluidValue: [0, 0, "px"],
							id: "01H05M7PQJGG0T4R6SE0B90BQY",
						},
						{
							property: "border-radius",
							value: "var(--radius-m)",
							fluidValue: [0, 0, "px"],
							id: "4",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-m)",
							fluidValue: [0, 0, "px"],
							id: "01H4DX0M24B0Z50P5AWDF1VC2F",
						},
					],
				},
				{
					id: "variant-2",
					type: "variant",
					parentId: "default",
					variantSelector: ".secondary",
					declarations: [
						{
							property: "background",
							value: "var(--secondary)",
							fluidValue: [0, 0, "px"],
							id: "01H4DWYW996PEEQD8ZC6BH3P93",
						},
						{
							property: "color",
							value: "#fff",
							fluidValue: [0, 0, "px"],
							id: "01H4DWZXGPM4SV8XRJSEC1ZJCY",
						},
					],
				},
				{
					id: "variant-3",
					type: "variant",
					parentId: "default",
					variantSelector: ".primary",
					declarations: [
						{
							property: "background",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H4DXBK41R87KK6M3PEW8639E",
						},
						{
							property: "color",
							value: "#fff",
							fluidValue: [0, 0, "px"],
							id: "01H4DXBZFWZ989QVC1APT87PY5",
						},
					],
				},
			],
			order: ["default", "variant-3", "variant-2"],
		},
		{
			id: "17",
			selector: ".icon",
			type: "icon",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H03HQAHBYGZXCFC1WVB40NJC",
						},
						{
							property: "width",
							value: "var(--space-2xl)",
							fluidValue: [0, 0, "px"],
							id: "01H03HXBGDBYY8EMPCCSGFA5CY",
						},
						{
							property: "height",
							value: "auto",
							fluidValue: [0, 0, "px"],
							id: "01H03HZ45Z855S7T826J0DSCZ4",
						},
						{
							property: "font-size",
							value: "var(--space-2xl)",
							fluidValue: [0, 0, "px"],
							id: "01H7XMHN3DC2B6YDTQDV0VH0YY",
						},
					],
				},
				{
					id: "1",
					type: "variant",
					parentId: "default",
					variantSelector: ".large",
					declarations: [
						{
							property: "width",
							value: "var(--space-3xl)",
							fluidValue: [0, 0, "px"],
							id: "01H03JCJP3E9ZCZ2X7M4W5AZV4",
						},
						{
							property: "font-size",
							value: "var(--space-3xl)",
							fluidValue: [0, 0, "px"],
							id: "01H7XMHD6J6G9C49BX59EHHG5F",
						},
					],
				},
				{
					id: "01H7XMKQ8G8AJ253128HMNCJZ3",
					type: "variant",
					parentId: "default",
					variantSelector: ".secondary",
					declarations: [
						{
							property: "color",
							value: "var(--secondary)",
							fluidValue: [0, 0, "px"],
							id: "01H03JCJP3E9ZCZ2X7M4W5AZV4",
						},
					],
				},
				{
					id: "01H7XMQYKA98R542MQN0WJ2YX6",
					type: "variant",
					parentId: "default",
					variantSelector: ".tertiary",
					declarations: [
						{
							property: "color",
							value: "var(--tertiary)",
							fluidValue: [0, 0, "px"],
							id: "01H03JCJP3E9ZCZ2X7M4W5AZV4",
						},
					],
				},
				{
					id: "01H7XMMW0DYJVCK68KAE96PPQV",
					type: "variant",
					parentId: "default",
					variantSelector: ".outline",
					declarations: [
						{
							property: "padding",
							value: "0.5em",
							fluidValue: [0, 0, "px"],
							id: "01H03JCJP3E9ZCZ2X7M4W5AZV4",
						},
						{
							property: "border",
							value: "1px solid var(--border-primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XMNMMKFCMWTQ7R1V0VNFQW",
						},
						{
							property: "border-radius",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7XMNWFDJVA1ZTMGT74JFJW8",
						},
						{
							property: "box-sizing",
							value: "content-box",
							fluidValue: [0, 0, "px"],
							id: "01H7XMN7VRB41XWDMG6048G9A5",
						},
					],
				},
				{
					id: "01H7XMSWZ8JQ23MKC7CRPQPZWT",
					type: "variant",
					parentId: "default",
					variantSelector: ".filled",
					declarations: [
						{
							property: "padding",
							value: "0.5em",
							fluidValue: [0, 0, "px"],
							id: "01H03JCJP3E9ZCZ2X7M4W5AZV4",
						},
						{
							property: "border-radius",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7XMNWFDJVA1ZTMGT74JFJW8",
						},
						{
							property: "box-sizing",
							value: "content-box",
							fluidValue: [0, 0, "px"],
							id: "01H7XMN7VRB41XWDMG6048G9A5",
						},
						{
							property: "background",
							value: "var(--dark-10)",
							fluidValue: [0, 0, "px"],
							id: "01H7XMTKD4ZG5FQK8JDGVRXB96",
						},
					],
				},
				{
					id: "2",
					type: "variant",
					parentId: "default",
					variantSelector: ".small",
					declarations: [
						{
							property: "width",
							value: "var(--space-l)",
							fluidValue: [0, 0, "px"],
							id: "01H03JE4CJRXSYY698MHKZ716W",
						},
						{
							property: "font-size",
							value: "var(--space-l)",
							fluidValue: [0, 0, "px"],
							id: "01H7XMH7VVBVRB1ZZ86ENCZQ06",
						},
					],
				},
			],
			order: [
				"default",
				"variant-4",
				"2",
				"1",
				"01H7XMKQ8G8AJ253128HMNCJZ3",
				"01H7XMQYKA98R542MQN0WJ2YX6",
				"01H7XMMW0DYJVCK68KAE96PPQV",
				"01H7XMSWZ8JQ23MKC7CRPQPZWT",
				"variant-4",
				"variant-5",
			],
		},
		{
			id: "24",
			selector: ".avatar",
			type: "img",
			variants: [
				{
					id: "default",
					type: "default",
					parentId: "default",
					declarations: [
						{
							property: "width",
							value: "var(--space-2xl)",
							fluidValue: [0, 0, "px"],
							id: "01H03HXBGDBYY8EMPCCSGFA5CY",
						},
						{
							property: "height",
							value: "var(--space-2xl)",
							fluidValue: [0, 0, "px"],
							id: "01H03HZ45Z855S7T826J0DSCZ4",
						},
						{
							property: "border-radius",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H03J5WDKVGQP2BQBZTABYNDG",
						},
						{
							property: "box-shadow",
							value: "var(--shadow-m)",
							fluidValue: [0, 0, "px"],
							id: "01H03MHN91S582VKNJ834X6S0Q",
						},
						{
							property: "object-fit",
							value: "cover",
							fluidValue: [0, 0, "px"],
							id: "01H03N9E7NS8V1TV5JC0MFMKQF",
						},
					],
				},
				{
					id: "1",
					type: "variant",
					parentId: "default",
					variantSelector: ".small",
					declarations: [
						{
							property: "width",
							value: "var(--space-l)",
							fluidValue: [0, 0, "px"],
							id: "01H03JE4CJRXSYY698MHKZ716W",
						},
						{
							property: "height",
							value: "var(--space-l)",
							fluidValue: [0, 0, "px"],
							id: "01H03JF74SYT39WMBTJQ8PXG31",
						},
					],
				},
				{
					id: "2",
					type: "variant",
					parentId: "default",
					variantSelector: ".large",
					declarations: [
						{
							property: "width",
							value: "var(--space-4xl)",
							fluidValue: [0, 0, "px"],
							id: "01H03JCJP3E9ZCZ2X7M4W5AZV4",
						},
						{
							property: "height",
							value: "var(--space-4xl)",
							fluidValue: [0, 0, "px"],
							id: "01H03JDAE6CHNYGJ2PPF2RXCQN",
						},
					],
				},
			],
			order: ["default", "1", "2"],
		},
		{
			id: "29",
			selector: ".divider",
			type: "hr",
			variants: [
				{
					id: "01H7XSHWXFH4TAFPE5V1SJQ9SV",
					type: "default",
					declarations: [
						{
							property: "min-width",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7YTT8FPJZE1A3ZFM2ZVXQSY",
						},
						{
							property: "width",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "max-width",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7YTS6S36RZTWZ4RF7T24C3R",
						},
						{
							property: "min-height",
							value: "1px",
							fluidValue: [0, 0, "px"],
							id: "01H7YTTF2P8D4F203A2G21CJST",
						},
						{
							property: "height",
							value: "1px",
							fluidValue: [0, 0, "px"],
							id: "01H7XSTEA4C5JR8418GTG54VE8",
						},
						{
							property: "max-height",
							value: "1px",
							fluidValue: [0, 0, "px"],
							id: "01H7YTQ1D9BPYDBF09B1GW84Y2",
						},
						{
							property: "background",
							value: "var(--border-primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7XSTK9VJ88CKSRYV27GBAPJ",
						},
						{
							property: "margin",
							value: "var(--space-m) 0",
							fluidValue: [0, 0, "px"],
							id: "01H7XSW78K8BJ5Z1B1HMJXBQ44",
						},
						{
							property: "border",
							value: "0",
							fluidValue: [0, 0, "px"],
							id: "01H7XT25XV7GC0AJMF6QE4SYPN",
						},
					],
				},
				{
					id: "variant-2",
					type: "variant",
					parentId: "01H7XSHWXFH4TAFPE5V1SJQ9SV",
					variantSelector: ".vertical",
					declarations: [
						{
							property: "min-width",
							value: "1px",
							fluidValue: [0, 0, "px"],
							id: "01H7YTTZQQD7B3Z2KJ4A75JCGF",
						},
						{
							property: "width",
							value: "1px",
							fluidValue: [0, 0, "px"],
							id: "01H7XSV8PWYHV64S3SH7ZHYW57",
						},
						{
							property: "max-width",
							value: "1px",
							fluidValue: [0, 0, "px"],
							id: "01H7YTR4VGN9PZT581AETZ08CT",
						},
						{
							property: "min-height",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7YTTRN999WFTV0WZN31TEVN",
						},
						{
							property: "height",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7XT5M8NNZJASXD1426EHWSF",
						},
						{
							property: "max-height",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7YTRY6N9288YRBEZFEAS26E",
						},
					],
				},
			],
			order: ["default", "variant-2"],
		},
		{
			id: "31",
			selector: ".checkbox",
			type: "checkbox",
			variants: [
				{
					id: "01H7YRNS62BZCCQQ96BRHG9T8E",
					type: "default",
					declarations: [
						{
							property: "appearance",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "display",
							value: "grid",
							fluidValue: [0, 0, "px"],
							id: "01H7YSER33D3KRRR7FQTPCBGXM",
						},
						{
							property: "place-content",
							value: "center",
							fluidValue: [0, 0, "px"],
							id: "01H7YSEZ56ZJ0SFA9Y84284Q8B",
						},
						{
							property: "border",
							value: "2px solid var(--dark-40)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSANWR5YVRFJ16R9RVS6H7",
						},
						{
							property: "border-radius",
							value: "var(--radius-s)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSFJE34KAZY3FK518DZ7ZZ",
						},
						{
							property: "width",
							value: "2rem",
							type: "fluid",
							fluidValue: [18, 22, "px"],
							id: "01H7YSBES6KNSFXC2ZP11363ZT",
						},
						{
							property: "height",
							value: "2rem",
							type: "fluid",
							fluidValue: [18, 22, "px"],
							id: "01H7YSBYT10EEDRSVZK0TWA1ZC",
						},
					],
				},
				{
					id: "variant-2",
					type: "variant",
					parentId: "01H7YRNS62BZCCQQ96BRHG9T8E",
					variantSelector: ":checked:before",
					declarations: [
						{
							property: "transform",
							value: "scale(1)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSGH3HSHA47KRKDS74CW1T",
						},
					],
				},
				{
					id: "before-4",
					type: "before",
					parentId: "default",
					declarations: [
						{
							property: "content",
							value: '""',
							fluidValue: [0, 0, "px"],
							id: "01H7YT245YDARX5607VVCMFKT5",
						},
						{
							property: "width",
							value: "1em",
							fluidValue: [0, 0, "px"],
							id: "01H7YT2CX2C5RYT1K9X5BB1V45",
						},
						{
							property: "height",
							value: "1em",
							fluidValue: [0, 0, "px"],
							id: "01H7YT2JJWRHNCJZJHA5JSQZC8",
						},
						{
							property: "box-shadow",
							value: "inset 1em 1em #fff",
							fluidValue: [0, 0, "px"],
							id: "01H7YT4ZEQ75X0JAE5XW628XCV",
						},
						{
							property: "clip-path",
							value: "polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)",
							fluidValue: [0, 0, "px"],
							id: "01H7YT3FZ9H7M33YNQSTC4W9SW",
						},
						{
							property: "transform",
							value: "scale(0)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSZCPMXN4MF4MBE5PNN159",
						},
						{
							property: "transition",
							value: "transform 0.2s",
							fluidValue: [0, 0, "px"],
							id: "01H7YSZJC68XXMSS1V6QHRS7KK",
						},
					],
				},
				{
					id: "hover-5",
					type: "hover",
					parentId: "default",
					declarations: [
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7YT6GF7N70BYAMHH299KS6R",
						},
					],
				},
				{
					id: "focus-6",
					type: "focus",
					parentId: "default",
					declarations: [
						{
							property: "outline",
							value: "3px solid var(--primary-l-3)",
							fluidValue: [0, 0, "px"],
							id: "01H7YTN772CE2FG2Y91RTFRYTD",
						},
						{
							property: "outline-offset",
							value: "2px",
							fluidValue: [0, 0, "px"],
							id: "01H7YTNM9SRNHKB81S4G95V771",
						},
					],
				},
				{
					id: "checked-7",
					type: "checked",
					parentId: "default",
					declarations: [
						{
							property: "background",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7ZA2DGMBTD4SFJNFWYKA3T2",
						},
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7ZA2GNXBM0CS81PPX1ERH3Z",
						},
					],
				},
			],
			order: ["default", "variant-2"],
		},
		{
			id: "32",
			selector: ".radio",
			type: "radio",
			variants: [
				{
					id: "01H7YRNS62BZCCQQ96BRHG9T8E",
					type: "default",
					declarations: [
						{
							property: "appearance",
							value: "none",
							fluidValue: [0, 0, "px"],
							id: "1",
						},
						{
							property: "display",
							value: "grid",
							fluidValue: [0, 0, "px"],
							id: "01H7YSER33D3KRRR7FQTPCBGXM",
						},
						{
							property: "place-content",
							value: "center",
							fluidValue: [0, 0, "px"],
							id: "01H7YSEZ56ZJ0SFA9Y84284Q8B",
						},
						{
							property: "border",
							value: "2px solid var(--dark-40)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSANWR5YVRFJ16R9RVS6H7",
						},
						{
							property: "border-radius",
							value: "var(--radius-full)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSFJE34KAZY3FK518DZ7ZZ",
						},
						{
							property: "width",
							value: "2rem",
							type: "fluid",
							fluidValue: [18, 22, "px"],
							id: "01H7YSBES6KNSFXC2ZP11363ZT",
						},
						{
							property: "height",
							value: "2rem",
							type: "fluid",
							fluidValue: [18, 22, "px"],
							id: "01H7YSBYT10EEDRSVZK0TWA1ZC",
						},
					],
				},
				{
					id: "variant-2",
					type: "variant",
					parentId: "01H7YRNS62BZCCQQ96BRHG9T8E",
					variantSelector: ":checked:before",
					declarations: [
						{
							property: "transform",
							value: "scale(1)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSSBKVFA7Y0X3TZ84SQD3Z",
						},
					],
				},
				{
					id: "before-4",
					type: "before",
					parentId: "default",
					declarations: [
						{
							property: "content",
							value: '""',
							fluidValue: [0, 0, "px"],
							id: "01H7YT245YDARX5607VVCMFKT5",
						},
						{
							property: "width",
							value: "1em",
							fluidValue: [0, 0, "px"],
							id: "01H7YT2CX2C5RYT1K9X5BB1V45",
						},
						{
							property: "height",
							value: "1em",
							fluidValue: [0, 0, "px"],
							id: "01H7YT2JJWRHNCJZJHA5JSQZC8",
						},
						{
							property: "border-radius",
							value: "100%",
							fluidValue: [0, 0, "px"],
							id: "01H7YVZ430A13HMWMSJ6N456BX",
						},
						{
							property: "transform",
							value: "scale(0)",
							fluidValue: [0, 0, "px"],
							id: "01H7YSZCPMXN4MF4MBE5PNN159",
						},
						{
							property: "transition",
							value: "transform 0.2s",
							fluidValue: [0, 0, "px"],
							id: "01H7YSZJC68XXMSS1V6QHRS7KK",
						},
						{
							property: "background",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7YVZHENN54RT912C6NDAJV9",
						},
					],
				},
				{
					id: "hover-5",
					type: "hover",
					parentId: "default",
					declarations: [
						{
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
							id: "01H7YT6GF7N70BYAMHH299KS6R",
						},
					],
				},
				{
					id: "focus-6",
					type: "focus",
					parentId: "default",
					declarations: [
						{
							property: "outline",
							value: "3px solid var(--primary-l-3)",
							fluidValue: [0, 0, "px"],
							id: "01H7YTN772CE2FG2Y91RTFRYTD",
						},
						{
							property: "outline-offset",
							value: "2px",
							fluidValue: [0, 0, "px"],
							id: "01H7YTNM9SRNHKB81S4G95V771",
						},
					],
				},
				{
					id: "checked-7",
					parentId: "default",
					type: "checked",
					declarations: [
						{
							id: "01H7ZB8WY1YG6Y6NZF4F80HQBZ",
							property: "border-color",
							value: "var(--primary)",
							fluidValue: [0, 0, "px"],
						},
					],
				},
			],
			order: ["default", "variant-2"],
		},
	],
};
