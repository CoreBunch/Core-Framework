import { ToolbarButton } from "@wordpress/components";
import { subscribe } from "@wordpress/data";
import { render } from "@wordpress/element";

const THEME_TOGGLE_BUTTON_CLASS = "cf-theme-toggle-button";

enum ThemeClasses {
	DARK = "cf-theme-dark",
	LIGHT = "cf-theme-light",
}

type IconProps = {
	size?: number;
	color?: string;
};

const FilledLightModeIcon = ({ size = 24, color }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="cf-theme-icon cf-light-mode-icon"
		color="currentColor"
		fill="currentColor"
		viewBox="0 0 24 24"
		style={{
			width: size,
			height: size,
			...(color
				? {
						color,
				  }
				: {}),
		}}
	>
		<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
	</svg>
);

const FilledDarkModeIcon = ({ size = 24, color }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="cf-theme-icon cf-dark-mode-icon"
		color="currentColor"
		fill="currentColor"
		viewBox="0 0 24 24"
		style={{
			width: size,
			height: size,
			...(color
				? {
						color,
				  }
				: {}),
		}}
	>
		<path d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" />
	</svg>
);

const OutlineLightModeIcon = ({ size = 24, color }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="cf-theme-icon cf-light-mode-icon"
		color="currentColor"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		strokeLinecap="round"
		strokeLinejoin="round"
		viewBox="0 0 24 24"
		style={{
			width: size,
			height: size,
			...(color
				? {
						color,
				  }
				: {}),
		}}
	>
		<path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
	</svg>
);

const OutlineDarkModeIcon = ({ size = 24, color }: IconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="cf-theme-icon cf-dark-mode-icon"
		color="currentColor"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		strokeLinecap="round"
		strokeLinejoin="round"
		viewBox="0 0 24 24"
		style={{
			width: size,
			height: size,
			...(color
				? {
						color,
				  }
				: {}),
		}}
	>
		<path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
	</svg>
);

type IconsProps = {
	icon_size?: number;
	dark_mode_color?: string;
	light_mode_color?: string;
	icon_type?: "filled" | "outline";
};

export const Icons = ({ icon_size, dark_mode_color, light_mode_color, icon_type }: IconsProps) => (
	<>
		{icon_type === "filled" ? (
			<FilledDarkModeIcon size={icon_size} color={dark_mode_color} />
		) : (
			<OutlineDarkModeIcon size={icon_size} color={dark_mode_color} />
		)}

		{icon_type === "filled" ? (
			<FilledLightModeIcon size={icon_size} color={light_mode_color} />
		) : (
			<OutlineLightModeIcon size={icon_size} color={light_mode_color} />
		)}
	</>
);

const toggleTheme = (_newTheme?: "dark" | "light") => {
	const html = document.querySelector("html");

	if (!html) {
		return;
	}

	const newTheme = _newTheme ?? html.classList.contains(ThemeClasses.DARK) ? "light" : "dark";

	window?.localStorage?.setItem("cf-theme", newTheme);

	html.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
	html.classList.add(newTheme === "light" ? ThemeClasses.LIGHT : ThemeClasses.DARK);

	[...document.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)].forEach((button) => {
		button.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
		button.classList.add(newTheme === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);
	});

	document.querySelectorAll("iframe")?.forEach((iframe) => {
		const iframeHtml = iframe.contentDocument?.querySelector("html");

		if (!iframeHtml) {
			return;
		}

		iframeHtml.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
		iframeHtml.classList.add(newTheme === "light" ? ThemeClasses.LIGHT : ThemeClasses.DARK);

		const contentDocument = iframe.contentDocument;

		if (!contentDocument) {
			return;
		}

		[...contentDocument?.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)]?.forEach((button) => {
			button.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
			button.classList.add(newTheme === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);
		});
	});
};

const ToggleButton = () => {
	return (
		<ToolbarButton
			title={"Preview Theme (CF)"}
			icon={
				<Icons
					icon_size={18}
					icon_type="outline"
					dark_mode_color="black"
					light_mode_color="black"
				/>
			}
			className={`cf-theme-toggle-button`}
			label="Toggle Theme Preview"
			style={{ padding: "6px" }}
			onClick={() => toggleTheme()}
			aria-label="Preview Theme (CF)"
			onPointerEnterCapture={null}
			onPointerLeaveCapture={null}
			placeholder={null}
		/>
	);
};

export const PreviewTheme = () => {
	const renderButton = (selector: HTMLElement) => {
		const toolbarButton = document.createElement("div");
		toolbarButton.classList.add("core-framework-theme-preview");
		selector.appendChild(toolbarButton);
		render(<ToggleButton />, toolbarButton);
	};

	if (window?.core_framework_connector?.gutenberg_enable_dark_mode_preview ?? true) {
		subscribe(() => {
			const editToolbar =
				document.querySelector(".edit-post-header-toolbar") ||
				document.querySelector(".edit-site-header-edit-mode__toolbar");

			if (!editToolbar) {
				return;
			}

			if (editToolbar?.querySelector(".core-framework-theme-preview")) {
				return;
			}

			renderButton(editToolbar as HTMLElement);
		});
	}
};

const getSystemThemeClass = (): "dark" | "light" =>
	window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

document.addEventListener("DOMContentLoaded", () =>
	setTimeout(() => {
		const themeMode = window?.core_framework_connector?.theme_mode ?? "light";
		const html = document.querySelector("html");

		if (!html) {
			return;
		}

		html.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);

		let theme = window?.localStorage?.getItem("cf-theme") as "dark" | "light" | "auto" | null;

		if (!theme) {
			theme = themeMode;
		}
		if (theme === "auto") {
			theme = getSystemThemeClass();
		}

		html?.classList.add(theme === "light" ? ThemeClasses.LIGHT : ThemeClasses.DARK);

		document.querySelectorAll("iframe")?.forEach((iframe) => {
			const contentDocument = iframe.contentDocument;
			const iframeHtml = contentDocument?.querySelector("html");

			if (!iframeHtml) {
				return;
			}

			iframeHtml.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
			iframeHtml.classList.add(theme === "light" ? ThemeClasses.LIGHT : ThemeClasses.DARK);

			[...(contentDocument?.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS) ?? [])]?.forEach((button) => {
				button.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
				button.classList.add(theme === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);
			});
		});

		const togglePreviewButton = document.querySelector(".cf-theme-toggle-button");

		togglePreviewButton?.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
		togglePreviewButton?.classList.add(theme === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);

		[...document.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)]?.forEach((button) => {
			button.classList.remove(...[ThemeClasses.DARK, ThemeClasses.LIGHT]);
			button.classList.add(theme === "dark" ? ThemeClasses.LIGHT : ThemeClasses.DARK);
		});
	}, 200),
);
