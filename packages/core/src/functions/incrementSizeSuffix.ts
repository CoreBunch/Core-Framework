import { SIZES } from "constants/sizes";

export const incrementSizeSuffix = (steps: string, direction: "UP" | "DOWN") => {
	const arr = steps.split(",");

	if (direction === "DOWN") {
		const index = SIZES.indexOf(arr[arr.length - 1]);
		const addedSize = SIZES[index + 1];

		return addedSize ? [...arr, addedSize].join(",") : steps;
	}

	const index = SIZES.indexOf(arr[0]);
	const addedSize = SIZES[index - 1];

	return addedSize ? [addedSize, ...arr].join(",") : steps;
};
