export function warning(condition, message: string) {
	if (!condition) {
		console.error(message);
	}
}
