{
	const DARK_MODE_CLASS_NAME = "cf-theme-dark";
	const LIGHT_MODE_CLASS_NAME = "cf-theme-light";
	const LOCAL_THEME_NAME = "cf-theme";
	const TRANSITION_DURATION = 300;
	const THEME_TOGGLE_BUTTON_CLASS = "cf-theme-toggle-button";

	type ThemeState = "dark" | "light";

	const toggleIcon = (state: ThemeState) =>
		[...document.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)].forEach((button) => {
			button.classList.remove(state === "dark" ? LIGHT_MODE_CLASS_NAME : DARK_MODE_CLASS_NAME);
			button.classList.add(state === "dark" ? DARK_MODE_CLASS_NAME : LIGHT_MODE_CLASS_NAME);
		});

	const onThemeTransitionStart = () => {
		const css = `* {
			transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important;
			transition-timing-function: ease-in-out !important;
			transition-duration: ${TRANSITION_DURATION}ms !important;
		}`;
		const head = document.head || document.getElementsByTagName("head")[0];
		const style = document.createElement("style");

		style.appendChild(document.createTextNode(css));
		head.appendChild(style);

		setTimeout(() => style.remove(), TRANSITION_DURATION);
	};

	const iconsToSun = () => {
		const h = document.querySelector("html");
		if (!h?.classList.contains(DARK_MODE_CLASS_NAME)) {
			return;
		}

		[...document.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)].forEach((b) => {
			b.classList.remove(DARK_MODE_CLASS_NAME);
			b.classList.add(LIGHT_MODE_CLASS_NAME);
		});
	};

	document.addEventListener("DOMContentLoaded", () => {
		if (localStorage.getItem(LOCAL_THEME_NAME) !== null) {
			if (localStorage.getItem(LOCAL_THEME_NAME) === "dark") toggleIcon("light");
			else toggleIcon("dark");
		} else iconsToSun();

		[...document.getElementsByClassName(THEME_TOGGLE_BUTTON_CLASS)].forEach((b) =>
			b.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				onThemeTransitionStart();
				const h = document.getElementsByTagName("html")?.[0];
				h?.classList?.toggle(DARK_MODE_CLASS_NAME);
				h?.classList?.toggle(LIGHT_MODE_CLASS_NAME);
				toggleIcon(h?.classList.contains(DARK_MODE_CLASS_NAME) ? "light" : "dark");
				localStorage.setItem(
					LOCAL_THEME_NAME,
					h?.classList.contains(DARK_MODE_CLASS_NAME) ? "dark" : "light",
				);
			}),
		);
	});
}
