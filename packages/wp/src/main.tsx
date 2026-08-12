import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Toaster } from "sonner";
import { App } from "./App";

const theme = localStorage.getItem("themeMode") || "dark";
document.documentElement.dataset.colorMode = theme;

document.documentElement.setAttribute("data-theme", theme);

ReactDOM.createRoot(document.getElementById("core-framework-init") as HTMLElement).render(
	<React.StrictMode>
		<MantineProvider
			theme={{
				colorScheme: "dark",
				colors: {
					primary: [
						"#e4e7ff",
						"#b4bbff",
						"#838dfb",
						"#5360f9",
						"#2432f6",
						"#0d19dc",
						"#0613ac",
						"#030e7c",
						"#00074d",
						"#00021f",
					],
				},
			}}
		>
			<Toaster richColors />
			<App />
		</MantineProvider>
	</React.StrictMode>,
);
