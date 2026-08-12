import { memo } from "react";
import { PresetManger } from "components/presetManager/PresetManager";

export const ImportExport = memo(() => {
	return (
		<section className="section import-export">
			<div className="subsection">
				<PresetManger />
			</div>
		</section>
	);
});

ImportExport.displayName = "ImportExport";
