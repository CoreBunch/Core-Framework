import { memo } from "react";
import { ImportButton } from "./ui/ImportButton";
import { Tooltip } from "./ui/Tooltip";

interface CreateNewGroup {
	btnLabel: string;
	tooltipLabel: string;
	onBtnClick: () => void;
	onImportClick: () => void;
}

export const CreateNewGroup = memo<CreateNewGroup>(
	({ btnLabel, tooltipLabel, onBtnClick, onImportClick }) => {
		return (
			<div className="row gap-s i margin-bottom-l">
				<button onClick={onBtnClick} className="new-group full-width">
					{btnLabel}
				</button>

				<Tooltip label={tooltipLabel} width={250} multiline withArrow>
					<ImportButton onclick={onImportClick} />
				</Tooltip>
			</div>
		);
	},
);

CreateNewGroup.displayName = "CreateNewGroup";
