import { Tooltip as MantineTooltip, TooltipProps } from "@mantine/core";

const DEFAULT_CONFIGURATION: Partial<TooltipProps> = {
	position: "top",
};

const DEFAULT_LABEL = "Missing label" as const;

interface ITooltip {
	readonly children: React.ReactNode;
	readonly label: string;
	readonly rest?: Partial<TooltipProps>;
}

export const Tooltip = ({ children, label = DEFAULT_LABEL, ...rest }: ITooltip & Partial<TooltipProps>) => {
	const tooltipConfiguration = {
		...DEFAULT_CONFIGURATION,
		...rest,
	};

	if (!label) {
		return <>{children}</>;
	}

	return (
		<MantineTooltip label={label} {...tooltipConfiguration}>
			{children}
		</MantineTooltip>
	);
};
