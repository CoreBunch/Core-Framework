import { IS_DEV } from "constants/isDev";

export function devLog(msg: string, ...args: any[]) {
	const isQueryParamDevMode = new URLSearchParams(window?.location?.search ?? {}).get("dev_mode") !== null;

	if (IS_DEV || window?.secret_dev_mode || isQueryParamDevMode) {
		console.info(`👀 %c${msg}`, "color: #22f0d2", ...args);
	}
}
