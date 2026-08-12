import { memo } from "react";
import editorHtml from "../.generated/editor/editor.html?raw";

interface HomeProps {
	showIframe: boolean | null;
}

export const Home = memo<HomeProps>(({ showIframe }) => {
	return (
		<div className="home-screen" style={{ display: showIframe ? "block" : "none" }}>
			<div className="content">
				<iframe
					srcDoc={editorHtml}
					title="Core Framework editor"
					id="web-app"
					allow="clipboard-read; clipboard-write"
				/>
			</div>
		</div>
	);
});
