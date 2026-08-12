import { memo } from "react";
import { Tooltip } from "components/ui/Tooltip";
import { ClassGeneratorValue, ColorItem } from "../index";
import { Chip } from "@mantine/core";

const CLASS_OPTIONS: {
	label: string;
	value: ClassGeneratorValue;
	description: string;
}[] = [
	{
		label: "Text",
		value: "text",
		description:
			"Automatically generate text color classes for the selected color, including its respective transparencies, shades, and tints.",
	},
	{
		label: "Background",
		value: "bg",
		description:
			"Automatically generate background color classes for the selected color, including its respective transparencies, shades, and tints.",
	},
	{
		label: "Border",
		value: "border",
		description:
			"Automatically generate border color classes for the selected color, including its respective transparencies, shades, and tints.",
	},
	{
		label: "Fill",
		value: "fill",
		description:
			"Automatically generate fill color classes for the selected color, including its respective transparencies, shades, and tints.",
	},
];

interface ColorUtilityClasses {
	color: ColorItem;
	onOptionToggle: (option: ClassGeneratorValue) => void;
}

export const ColorUtilityClasses = memo<ColorUtilityClasses>(({ color, onOptionToggle }) => {
	return (
		<div className="row gap-l align-center space-between">
			<label className="row gap-s" htmlFor="padding">
				<h5>Generate utility classes</h5>
			</label>

			<div className="row gap-s align-self-stretch">
				{CLASS_OPTIONS.map(({ value, description, label }) => (
					<Tooltip
						key={value}
						label={description}
						position="top"
						openDelay={300}
						width={250}
						multiline
						withArrow
					>
						<div className={`color-option-${value}`}>
							<Chip checked={color.gen?.includes(value)} onClick={() => onOptionToggle(value)}>
								{label}
							</Chip>
						</div>
					</Tooltip>
				))}
			</div>
		</div>
	);
});

ColorUtilityClasses.displayName = "ColorUtilityClasses";
