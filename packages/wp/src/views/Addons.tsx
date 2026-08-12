import { memo, useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import bricksLogo from "assets/bricks.jpg";
import figmaLogo from "assets/figma.png";
import gutenbergLogo from "assets/gutenberg.jpg";
import oxygenLogo from "assets/oxygen.jpg";
import { AddonCard, ICard } from "components/ui/AddonCard";
import { AddonRow } from "components/ui/AddonRow";
import { localPreferencesAtom, setLocalPreferencesAtom } from "state";

interface IAddons {
	readonly withoutSection?: boolean;
	readonly isMinimal?: boolean;
}

type Addon = "gutenberg" | "oxygen" | "bricks" | "figma";
const descriptions = {
	gutenberg: {
		base: "Sync your classes and colors directly to Gutenberg and benefit from its custom autosuggestion.",
		small: "Adds a deep integration to Gutenberg",
	},
	oxygen: {
		base: "Sync your classes and colors directly to Oxygen Builder and benefit from its native autosuggestion.",
		small: "Adds a deep integration to Oxygen Builder",
	},
	bricks: {
		base: "Sync your classes and colors directly to Bricks Builder and benefit from its native autosuggestion.",
		small: "Adds a deep integration to Bricks Builder",
	},
	figma: {
		base: "Sync your project between Core Framework's Web App/WordPress plugin, and our plugin inside Figma.",
		small: "Adds a deep integration to Figma",
	},
};
const logos: Record<Addon, string> = {
	gutenberg: gutenbergLogo,
	oxygen: oxygenLogo,
	bricks: bricksLogo,
	figma: figmaLogo,
};

export const Addons = memo(({ isMinimal = false, withoutSection = false }: IAddons) => {
	const localPreferences = useAtomValue(localPreferencesAtom);
	const setPreferences = useSetAtom(setLocalPreferencesAtom);

	const handlePreferenceChange = (key: keyof Preferences, value: boolean | number) =>
		setPreferences({
			...localPreferences,
			[key]: value,
		});

	const dispatchAddonEvent = useCallback((addon: string) => {
		const event = new CustomEvent("addon-enabled", {
			detail: { addon },
		});
		document.dispatchEvent(event);
	}, []);

	const getDescription = useCallback(
		(key: Addon) => (isMinimal ? descriptions[key].small : descriptions[key].base),
		[isMinimal],
	);

	const createCard = useCallback(
		(key: Addon) => ({
			onChange: () => {
				handlePreferenceChange(key, !localPreferences?.[key]);
				if (key !== "figma") dispatchAddonEvent(key);
			},
			checked: Boolean(localPreferences?.[key]),
			imgUrl: logos[key],
			key,
			title: key.charAt(0).toUpperCase() + key.slice(1),
			description: getDescription(key),
		}),
		[handlePreferenceChange, localPreferences, getDescription, dispatchAddonEvent],
	);

	const ADDONS = useMemo(
		() => ["gutenberg", "oxygen", "bricks", "figma"].map((key) => createCard(key as Addon)),
		[createCard],
	) as (ICard & { key: string })[];

	if (withoutSection) {
		return (
			<>{ADDONS.map((card) => (isMinimal ? <AddonRow {...card} isMinimal /> : <AddonCard {...card} />))}</>
		);
	}

	return (
		<section id="addons" className="section">
			<div className="subsection">
				<h1>Add-ons</h1>
				<div className="columns-2 gap-l auto-fill">
					{ADDONS.map((card) => (isMinimal ? <AddonRow {...card} isMinimal /> : <AddonCard {...card} />))}
				</div>
			</div>
		</section>
	);
});

Addons.displayName = "Addons";
