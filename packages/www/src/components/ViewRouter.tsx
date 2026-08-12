import { Suspense, lazy, memo, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { Content } from "views/Content";
import { LoaderView } from "views/LoaderView";
import { Preview } from "views/Preview";
import { isLoadingAtom, selectedBreakpointAtom, viewAtom } from "state";

const Preferences = lazy(() =>
	import("views/Preferences").then((module) => ({
		default: module.Preferences,
	})),
);
const ImportExport = lazy(() =>
	import("views/ImportExport").then((module) => ({
		default: module.ImportExport,
	})),
);

const StyleGuide = lazy(() =>
	import("./StyleGuide/StyleGuide").then((module) => ({ default: module.StyleGuide })),
);

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
