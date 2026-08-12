import { memo, useEffect } from "react";
import { Info } from "assets/icons/Info.icon";
import { Tooltip } from "components/ui/Tooltip";
import { ColorItem } from "../index";
import { Switch } from "@mantine/core";
import clsx from "clsx";

interface ColorFeatureToggleProps {
	color: ColorItem;
	featureLabel: string;
	tooltipLabel: string;
	featureStateKey: keyof ColorItem;
	onToggleFeature: (value: boolean) => void;
	className?: string;
}

export const ColorFeatureToggle = memo<ColorFeatureToggleProps>(
	({ color, featureLabel, tooltipLabel, featureStateKey, onToggleFeature, className }) => {
		return (
			<div className={clsx("row gap-l space-between align-center", className)}>
				<label className="row gap-s" htmlFor="padding">
					<h5>{featureLabel}</h5>

					<Tooltip label={tooltipLabel} position="top" openDelay={300} width={250} multiline withArrow>
						<span className="help-tooltip">
							<Info />
						</span>
					</Tooltip>
				</label>

				<Switch
					labelPosition="left"
					checked={color[featureStateKey] as boolean}
					onChange={(e) => onToggleFeature(e.target.checked)}
				/>
			</div>
		);
	},
);

ColorFeatureToggle.displayName = "ColorFeatureToggle";
