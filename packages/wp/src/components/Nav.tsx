import { memo, useMemo } from "react";
import { clsx } from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { Save } from "assets/icons/Save.icon";
import coreFrameworkLogo from "assets/logo_transparent.png";
import { usePush } from "hooks/usePush";
import { NAV_ITEMS, NAV_ITEMS_BOTTOM } from "constants/navItems";
import { APP_VERSION } from "constants/version";
import { localPreferencesAtom, viewAtom } from "state";
import { isOxygen6Atom } from "state/activeBuildersAtoms";
import { Loader } from "./basic/Loader";
import { Tooltip } from "./ui/Tooltip";

const scrollTop = () => {
	const container = document.querySelector(".content");

	container?.scrollTo({
		top: 0,
		behavior: "instant" as ScrollBehavior,
	});
};

export const Nav = memo(() => {
	const [view, setView] = useAtom(viewAtom);
	const { handlePush, state } = usePush();

	const handleView = (value: View) => {
		setView(value);
		scrollTop();
	};

	const preferences = useAtomValue(localPreferencesAtom);

	const isOxygen6 = useAtomValue(isOxygen6Atom);

	const filteredNavItems = useMemo(() => {
		return NAV_ITEMS.filter((item) => {
			if (item.value === "FONTS" && preferences?.disable_fonts) {
				return false;
			}
			return true;
		});
	}, [preferences?.disable_fonts]);

	const filteredNavItemsBottom = useMemo(() => {
		const addonSettings: (typeof NAV_ITEMS_BOTTOM)[number][] = [];
		const settings: (typeof NAV_ITEMS_BOTTOM)[number][] = [];
		const addonValues = ["OXYGEN", "BRICKS", "GUTENBERG", "FIGMA"] as const;

		for (const item of NAV_ITEMS_BOTTOM) {
			if (
				addonValues.includes(item.value) &&
				preferences[item.value.toLowerCase() as "oxygen" | "bricks" | "gutenberg" | "figma"]
			) {
				if (item.value === "OXYGEN" && isOxygen6) {
					addonSettings?.push({ ...item, name: "Oxygen 6" });
				} else {
					addonSettings?.push(item);
				}
			} else if (!addonValues.includes(item.value)) {
				settings?.push(item);
			}
		}

		return [addonSettings, settings];
	}, [preferences, isOxygen6]);

	return (
		<nav className="nav">
			<div className="nav-scroll-wrapper">
				<ul>
					<Tooltip label="Save" position="bottom-start">
						<li id="push2" className="push btn-primary" onClick={() => handlePush()}>
							{state === "IDLE" ? <Save /> : <Loader size="small" />}
						</li>
					</Tooltip>

					{filteredNavItems.map((item) => (
						<Tooltip key={item.name} label={item.name} position="top-start">
							<li
								className={clsx({
									active: view === item.value,
								})}
								onClick={() => handleView(item.value)}
							>
								<item.icon />
								<span>{item.name}</span>
							</li>
						</Tooltip>
					))}
				</ul>

				<ul className="margin-top-auto">
					{filteredNavItemsBottom?.[0]?.length ? (
						<>
							{filteredNavItemsBottom?.[0]?.map((item) => (
								<Tooltip key={item.name} label={item.name} position="top-start">
									<li
										className={clsx({
											active: view === item.value,
										})}
										onClick={() => handleView(item.value as View)}
									>
										<item.icon />
										<span>{item.name}</span>
									</li>
								</Tooltip>
							))}
							<hr />
						</>
					) : null}

					{filteredNavItemsBottom?.[1]?.map((item) => (
						<Tooltip key={item.name} label={item.name} position="top-start">
							<li
								className={clsx({
									active: view === item.value,
								})}
								onClick={() => handleView(item.value as View)}
							>
								<item.icon />
								<span>{item.name}</span>
							</li>
						</Tooltip>
					))}
				</ul>
			</div>

			<hr />

			<div className="text-2xs opacity-50 padding-xs version">
				<img src={coreFrameworkLogo} alt="Core Framework Logo" />
				<span>{APP_VERSION}</span>
			</div>
		</nav>
	);
});

Nav.displayName = "Nav";
