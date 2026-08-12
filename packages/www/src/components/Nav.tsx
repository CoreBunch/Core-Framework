import { memo } from "react";
import { Refresh } from "../assets/icons/Refresh.icon";
import { Loader } from "@mantine/core";
import { clsx } from "clsx";
import { isFigma } from "functions/isFigma";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/index";
import { Save } from "assets/icons/Save.icon";
import { usePush } from "hooks/usePush";
import { NAV_ITEMS, NAV_ITEMS_BOTTOM } from "constants/navItems";
import { APP_VERSION } from "constants/version";
import { figmaAtom } from "../state/figmaAtom";
import { currentPresetAtom, viewAtom } from "state";
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
	const figma = useAtomValue(figmaAtom);

	const { handlePush, isLoading } = usePush();

	const handleView = (value: View) => {
		setView(value);
		scrollTop();
	};

	const navItemsBottom = isFigma()
		? [
				{
					name: "Figma",
					icon: () => <img src={"./assets/figma.png"} alt={"Figma"} style={{ borderRadius: "3px" }} />,
					value: "FIGMA",
				},
				...NAV_ITEMS_BOTTOM,
		  ]
		: NAV_ITEMS_BOTTOM;

	return (
		<nav className="nav">
			<div className="nav-scroll-wrapper">
				<ul>
					<Tooltip label="Save" position="bottom-start">
						<li id="push2" className="push btn-primary" onClick={handlePush}>
							{isLoading ? <Loader size="small" /> : <Save />}
						</li>
					</Tooltip>

					{isFigma() ? (
						<Tooltip label="Refresh" position="bottom-start">
							<li
								id="refresh-figma"
								className="push"
								onClick={() => {
									window.parent.postMessage(
										{
											type: "update-project",
											apiKey: figma.apiKey,
										},
										"*",
									);
								}}
							>
								{isLoading ? <Loader size="small" /> : <Refresh />}
							</li>
						</Tooltip>
					) : null}

					{NAV_ITEMS.map((item) => (
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
					{navItemsBottom.map((item) => (
						<Tooltip key={item.name} label={item.name} position="top-start">
							<li
								className={clsx({
									active: view === item.value,
								})}
								onClick={() => {
									if (item.value === "FIGMA") {
										parent.postMessage({ type: "figma-reopen" }, "*");
										return;
									}
									handleView(item.value as View);
								}}
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
				<img src="./logo_transparent.png" alt="Core Framework Logo" />
				<span>{APP_VERSION}</span>
			</div>
		</nav>
	);
});

Nav.displayName = "Nav";
