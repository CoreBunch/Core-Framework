import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Book } from "../assets/icons/Book.icon";
import { useChangeDetection } from "../hooks/useChangeDetection";
import { useGetColor } from "../hooks/useGetColor";
import { clsx } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { flags } from "flags";
import { useAtomValue, useSetAtom } from "jotai";
import { usePush } from "hooks/usePush";
import { hasUnsavedChangesAtom, isHandleSave } from "../state/saveAtom";
import { viewAtom } from "state";
import { Stats } from "./Stats";
import { Loader } from "./basic/Loader";
import { UpdatedWindow } from "./modules/colorSystem";
import { Tooltip } from "./ui/Tooltip";

type RollingContentItem = {
	key: string;
	content: React.ReactNode;
};

function RollingContent({ current }: { current: RollingContentItem }) {
	const [items, setItems] = useState<{ item: RollingContentItem; state: "enter" | "exit" | "idle" }[]>([
		{ item: current, state: "idle" },
	]);
	const prevKeyRef = useRef(current.key);

	useEffect(() => {
		if (current.key === prevKeyRef.current) return;

		prevKeyRef.current = current.key;

		setItems((prev) => {
			const exiting = prev
				.filter((i) => i.state !== "exit")
				.map((i) => ({ ...i, state: "exit" as const }));
			return [...exiting, { item: current, state: "enter" as const }];
		});

		const timer = setTimeout(() => {
			setItems([{ item: current, state: "idle" }]);
		}, 350);

		return () => clearTimeout(timer);
	}, [current]);

	return (
		<>
			{items.map(({ item, state }) => (
				<span
					key={item.key}
					className={clsx("save-button__roll-item", {
						"save-button__roll-item--enter": state === "enter",
						"save-button__roll-item--exit": state === "exit",
					})}
				>
					{item.content}
				</span>
			))}
		</>
	);
}

export const Side = memo(() => {
	const setView = useSetAtom(viewAtom);
	const canBeSaved = useAtomValue(isHandleSave);
	const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);

	const { colorVariables } = useGetColor();
	const { handlePush, isLoading } = usePush();

	// Use the change detection hook
	useChangeDetection();

	const isSaved = !isLoading && !hasUnsavedChanges;

	useHotkeys([
		[
			"mod+S",
			(e) => {
				e.preventDefault();
				handlePush();
			},
		],
	]);

	useHotkeys([
		[
			"mod+J",
			(e) => {
				e.preventDefault();
				setView("PREVIEW");
			},
		],
	]);

	useEffect(() => {
		if (canBeSaved) {
			const timeoutId = setTimeout(() => {
				handlePush();
			}, 300);
			return () => clearTimeout(timeoutId);
		}
	}, [canBeSaved, handlePush]);

	const rollingContent: RollingContentItem = useMemo(() => {
		if (isLoading) {
			return { key: "saving", content: <Loader size="within-button" /> };
		}
		if (isSaved) {
			return { key: "saved", content: "Changes saved" };
		}
		return { key: "idle", content: "Save changes" };
	}, [isLoading, isSaved]);

	return (
		<aside className="side">
			<div className="grid gap-s">
				<button
					onClick={() => {
						(window as unknown as UpdatedWindow).colorVariables = colorVariables;
						setView("PREVIEW");
					}}
					className={"btn-tertiary btn-m full-width"}
				>
					<span>Preview CSS</span>
				</button>

				<Tooltip
					label={"Please, save changes to apply."}
					opened={hasUnsavedChanges && !isLoading}
					position="bottom"
					withArrow
					width={200}
					multiline
				>
					<button
						id="push1"
						onClick={() => handlePush()}
						disabled={isLoading}
						className={clsx("btn-primary btn-m full-width save-button", {
							"pulse-animation": hasUnsavedChanges && !isLoading,
							"save-button--saved": isSaved,
						})}
					>
						<span className="save-button__placeholder">Save changes</span>
						<span className="save-button__roll">
							<RollingContent current={rollingContent} />
						</span>
					</button>
				</Tooltip>
			</div>

			<div className="side-bottom">
				{flags.styleguide ? (
					<button
						onClick={() => setView("STYLE_GUIDE")}
						className={"btn-tertiary btn-m full-width"}
						style={{ marginBottom: "var(--space-m)" }}
					>
						<span>Style Guide</span>
					</button>
				) : null}
				<Stats />

				<a href="https://docs.coreframework.com/" target="_blank" className="documentation">
					<Book />
					<p>Documentation</p>
				</a>
			</div>
		</aside>
	);
});

Side.displayName = "Side";
