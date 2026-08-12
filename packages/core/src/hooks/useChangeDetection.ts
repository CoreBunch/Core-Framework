import { useEffect, useRef } from "react";
import { sanitizePreset } from "functions/sanitizePreset";
import { useAtomValue, useSetAtom } from "jotai";
import { useDebounce } from "./useDebounce";
import { getPresetFromCurrentPresetAtom } from "state";
import { hasUnsavedChangesAtom, lastSavedStateAtom } from "state/saveAtom";

// Helper function to sort object keys recursively for consistent comparison
function sortObjectKeys(obj: any): any {
	if (obj === null || obj === undefined) return obj;
	if (Array.isArray(obj)) {
		return obj.map(sortObjectKeys);
	}
	if (typeof obj === "object") {
		const sorted: any = {};
		Object.keys(obj)
			.sort()
			.forEach((key) => {
				sorted[key] = sortObjectKeys(obj[key]);
			});
		return sorted;
	}
	return obj;
}

export function useChangeDetection() {
	// Use the same atom that builds the complete preset from all individual atoms
	const currentCompletePreset = useAtomValue(getPresetFromCurrentPresetAtom);
	const lastSavedState = useAtomValue(lastSavedStateAtom);
	const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);

	// Track if we've seen the first saved state
	const hasSeenSavedState = useRef(false);
	const previousStateRef = useRef<string>("");
	const previousSavedStateRef = useRef<string>("");

	// Debounce the preset to avoid rapid changes during initialization
	const debouncedPreset = useDebounce(currentCompletePreset, 100);

	useEffect(() => {
		// Skip if no preset or no saved state yet
		if (!debouncedPreset || !lastSavedState) {
			return;
		}

		// Sanitize and sort keys for consistent comparison
		const currentSanitized = sanitizePreset(debouncedPreset);
		const currentStateString = JSON.stringify(sortObjectKeys(currentSanitized));

		// Parse and sort the saved state for comparison
		let savedStateSorted = "";
		try {
			const savedParsed = JSON.parse(lastSavedState);
			savedStateSorted = JSON.stringify(sortObjectKeys(savedParsed));
		} catch (e) {
			// If parsing fails, fall back to string comparison
			savedStateSorted = lastSavedState;
		}

		// Check if this is the first time we're seeing a saved state
		if (!hasSeenSavedState.current) {
			hasSeenSavedState.current = true;
			previousStateRef.current = currentStateString;
			previousSavedStateRef.current = savedStateSorted;
			// On initial load, compare immediately to detect any existing changes
			const hasChanges = currentStateString !== savedStateSorted;
			setHasUnsavedChanges(hasChanges);
			return;
		}

		// If saved state changed (after a save), update our reference
		if (savedStateSorted !== previousSavedStateRef.current) {
			previousSavedStateRef.current = savedStateSorted;
			// After saving, we should have no changes
			setHasUnsavedChanges(false);
			previousStateRef.current = currentStateString;
			return;
		}

		// Skip if the current state hasn't changed since last check
		if (currentStateString === previousStateRef.current) {
			return;
		}

		previousStateRef.current = currentStateString;

		// Now do the actual comparison with the saved state
		const hasChanges = currentStateString !== savedStateSorted;
		setHasUnsavedChanges(hasChanges);
	}, [debouncedPreset, lastSavedState, setHasUnsavedChanges]);
}
