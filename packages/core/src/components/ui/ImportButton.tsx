import { forwardRef } from "react";
import { ImportExport } from "assets/icons/ImportExport.icon";

export const ImportButton = forwardRef<HTMLButtonElement, { onclick: () => void }>(({ onclick }, ref) => {
	return (
		<button
			ref={ref}
			onClick={onclick}
			className="new-group with-icon"
			style={{
				transform: "rotate(180deg)",
			}}
		>
			<ImportExport />
		</button>
	);
});
