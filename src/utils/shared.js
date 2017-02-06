export function warning(condition, message) {
	if (!condition) {
		console.error(message);
	}
}

export function throwError(message) {
	throw new Error(`MobX-Preact Error: ${ message }`);
}
