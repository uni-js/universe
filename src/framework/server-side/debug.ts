function hasEnvKey(envKey: string) {
	return process.env[envKey] !== undefined;
}

/**
 * 在调试模式下, 允许注入一个服务器延迟参数
 * 来模拟线上波动的网络环境
 *
 * @returns {number} 返回值会在给定的延迟基础上加上随机偏移值
 */
export function getServerDebugDelay(enableOffset = false): number | undefined {
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
