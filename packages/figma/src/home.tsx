import { memo } from "react";

interface HomeProps {
	showIframe: boolean | null;
}

export const Home = memo<HomeProps>(({ showIframe }) => {
	//https://core-framework-git-referencing-variables-23f66f-core-framework.vercel.app/#figma
	const iframeSrc =
		import.meta.env.VITE_APP_ENV === "development"
			? "https://core-framework-git-wp-www-figma-qol-update-core-framework.vercel.app/#figma"
			: "https://alpha.coreframework.com/#figma";

	return (
		<div className="home-screen" style={{ display: showIframe ? "block" : "none" }}>
			<div className="content">
				<iframe src={iframeSrc} title="Figma Plugin" id="web-app" allow="clipboard-read;clipboard-write" />
			</div>
		</div>
	);
});
