import { memo } from "react";
import { PropertyGroups } from "components/PropertyGroups";
import { TopBar } from "components/ui/TopBar";

export const Content = memo(() => {
	return (
		<>
			<TopBar />
			<PropertyGroups />
		</>
	);
});

Content.displayName = "Content";
