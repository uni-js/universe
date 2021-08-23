import SimplexNoise from 'simplex-noise';

/**
 * 生物群落类型
 */
export enum BiomeType {
	/**
	 * 雨林
	 */
	RAINFOREST = 'rf',
	/**
	 * 森林
	 */
	FOREST = 'fr',
	/**
	 * 湖泊
	 */
	LAKE = 'lk',
	/**
	 * 冰地
	 */
	ICELAND = 'ic',
	/**
	 * 山地
	 */
	MOUNTAIN = 'mt',
	/**
	 * 平原
	 */
	PLAIN = 'pl',
	/**
	 * 寒地
	 */
	COLD = 'co',
	/**
	 * 沙漠
	 */
	DESERT = 'ds',
	/**
	 * 旱地
	 */
	DRY = 'dr',
}

export class BiomePicker {
	static SCALE_RATIO: number = 50;

	private temperNoise: SimplexNoise;
	private wetNoise: SimplexNoise;

	constructor(seed: string) {
		this.temperNoise = new SimplexNoise(`temperature:${seed}`);
		this.wetNoise = new SimplexNoise(`wet:${seed}`);
	}
	/**
	 * 获取指定地点的气候平均温度
	 */
	private getTemperature(x: number, y: number) {
		const a = x / BiomePicker.SCALE_RATIO;
		const b = y / BiomePicker.SCALE_RATIO;
		return (this.temperNoise.noise2D(a, b) + 1) / 2;
	}
	/**
	 * 获取指定地点的气候平均湿度
	 */
	private getWet(x: number, y: number) {
		const a = x / BiomePicker.SCALE_RATIO;
		const b = y / BiomePicker.SCALE_RATIO;
		return (this.wetNoise.noise2D(a, b) + 1) / 2;
	}

	getBiomeType(x: number, y: number): BiomeType {
		const temper = this.getTemperature(x, y);
		const wet = this.getWet(x, y);

		if (wet > 0.7) {
			if (temper > 0.7) return BiomeType.RAINFOREST;
			if (temper > 0.5) return BiomeType.FOREST;
			else if (temper > 0.3) return BiomeType.LAKE;
			else return BiomeType.ICELAND;
		} else if (temper > 0.2) {
			if (temper > 0.7) return BiomeType.MOUNTAIN;
			else if (temper > 0.2) return BiomeType.PLAIN;
			else return BiomeType.COLD;
		} else {
			if (temper > 0.7) return BiomeType.DESERT;
			else return BiomeType.DRY;
		}
	}
}
