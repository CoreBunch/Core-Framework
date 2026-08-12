export function nextTick(callback: () => void, time: number = 0): void {
	setTimeout(callback, time);
}
