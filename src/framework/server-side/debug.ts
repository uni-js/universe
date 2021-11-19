function hasEnvKey(envKey: string) {
	return process.env[envKey] !== undefined;
}

/**
 * in debug mode, you can inject a delay param
 * to simulate the real network.
 *
 * @returns {number} offset will be added to the delay number you set.
 */
export function getServerDebugDelay(enableOffset = true): number | undefined {
	const param = process.env.DEBUG_SERVER_DELAY;
	if (param === undefined) return;

	const base = parseInt(param);
	const offset = Math.floor((Math.random() * base) / 2);
	return base + (enableOffset ? offset : 0);
}

export function getIsServerUseDelay() {
	return isDebugMode() && hasEnvKey('DEBUG_SERVER_DELAY');
}

export function isDebugMode() {
	return hasEnvKey('DEBUG');
}
