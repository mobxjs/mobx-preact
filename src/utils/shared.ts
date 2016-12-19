export function warning(condition, message: string) {
	if (!condition) {
		console.error(message);
	}
}

export function throwError(message?: string) {
	throw new Error(`MobX-Preact Error: ${ message }`);
}
