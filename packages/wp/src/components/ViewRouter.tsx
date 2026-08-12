import { Suspense, memo, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { Addons } from "views/Addons";
import { Bricks } from "views/Bricks";
import { Content } from "views/Content";
import { Figma } from "views/Figma";
import { Gutenberg } from "views/Gutenberg";
import { ImportExport } from "views/ImportExport";
import { LoaderView } from "views/LoaderView";
import { Oxygen } from "views/Oxygen";
import { Preferences } from "views/Preferences";
import { Preview } from "views/Preview";
import { isLoadingAtom, selectedBreakpointAtom, viewAtom } from "state";
import { StyleGuide } from "./StyleGuide/StyleGuide";

const ViewSwitch = ({ view }: { view: View }) => {
	switch (view) {
		case "PREFERENCES": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Preferences />
				</Suspense>
			);
		}
		case "PREVIEW": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Preview />
				</Suspense>
			);
		}
		case "IMPORT_EXPORT": {
			return (
				<Suspense fallback={<LoaderView />}>
					<ImportExport />
				</Suspense>
			);
		}
		case "LOADING": {
			return <LoaderView />;
		}
		case "ADDONS": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Addons />
				</Suspense>
			);
		}
		case "OXYGEN": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Oxygen />
				</Suspense>
			);
		}
		case "BRICKS": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Bricks />
				</Suspense>
			);
		}
		case "GUTENBERG": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Gutenberg />
				</Suspense>
			);
		}
		case "FIGMA": {
			return (
				<Suspense fallback={<LoaderView />}>
					<Figma />
				</Suspense>
			);
		}
		case "STYLE_GUIDE": {
			return (
				<Suspense fallback={<LoaderView />}>
					<StyleGuide />
				</Suspense>
			);
		}
		default: {
			return (
				<Suspense fallback={<LoaderView />}>
					<Content />
				</Suspense>
			);
		}
	}
};

export const ViewRouter = memo(() => {
	const view = useAtomValue(viewAtom);
	const isLoading = useAtomValue(isLoadingAtom);
	const selectedBreakpoint = useAtomValue(selectedBreakpointAtom);

	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<div ref={contentRef} className={clsx("content", selectedBreakpoint && "media-query-mode")}>
			<ViewSwitch view={view} />

			{isLoading
				? createPortal(
						<div className="view-router-overlay" />,
						contentRef?.current ?? document.querySelector(".content") ?? document.body,
				  )
				: null}
		</div>
	);
});

ViewRouter.displayName = "ViewRouter";
