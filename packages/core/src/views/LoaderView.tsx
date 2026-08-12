import { memo } from "react";
import { Loader } from "components/basic/Loader";

export const LoaderView = memo(() => {
	return (
		<div className="loader">
			<Loader size="medium" />
		</div>
	);
});

LoaderView.displayName = "LoaderView";
