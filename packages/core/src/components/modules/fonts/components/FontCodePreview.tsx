import React, { useEffect, useState } from "react";
import { Code } from "assets/icons/Code.icon";
import { Popover } from "@mantine/core";
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";

hljs.registerLanguage("css", css);

export function FontCodePreview({ fontFaceCss }: { fontFaceCss: string }) {
	const [opened, setOpened] = useState<boolean>(false);

	useEffect(() => {
		if (opened) {
			setTimeout(() => hljs.highlightAll(), 0);
		}
	}, [opened]);

	return (
		<Popover width="70%" position="left" opened={opened} onChange={setOpened} withArrow shadow="lg">
			<Popover.Target>
				<button className="import-fonts-back" onClick={() => setOpened((isOpened) => !isOpened)}>
					<Code />
					<span className="text-s">CSS Preview</span>
				</button>
			</Popover.Target>
			<Popover.Dropdown>
				<div className="generated-code-wrapper import-fonts-code">
					<pre className="generated-code">
						<code className="language-css">{fontFaceCss}</code>
					</pre>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
}
