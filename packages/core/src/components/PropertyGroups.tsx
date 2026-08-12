import { memo } from "react";
import { useAtomValue } from "jotai";
import { LoaderView } from "views/LoaderView";
import { useProperties } from "hooks/useProperties";
import { currentPresetAtom, viewAtom } from "state";
import { Group } from "./Group";

export const PropertyGroups = memo(() => {
	const currentPreset = useAtomValue(currentPresetAtom);

	const view = useAtomValue(viewAtom);

	const propertyGroups = useProperties();

	if (!currentPreset) {
		return <LoaderView />;
	}

	if (!propertyGroups?.[view as keyof typeof propertyGroups]) {
		return null;
	}

	return (
		<Group
			key={propertyGroups[view as keyof typeof propertyGroups].title}
			atom={propertyGroups[view as keyof typeof propertyGroups].atom}
			title={propertyGroups[view as keyof typeof propertyGroups].title}
			components={propertyGroups[view as keyof typeof propertyGroups].components}
			groupKey={propertyGroups[view as keyof typeof propertyGroups].groupKey}
		/>
	);
});

PropertyGroups.displayName = "PropertyGroups";
