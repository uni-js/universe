import SimplexNoise from 'simplex-noise';

export enum BiomeType {
	RAINFOREST,
	FOREST,
	LAKE,
	ICELAND,
	MOUNTAIN,
	PLAIN,
	COLD,
	DESERT,
	DRY,
}

export class BiomePicker {
	static SCALE_RATIO = 50;

	private temperNoise: SimplexNoise;
	private wetNoise: SimplexNoise;

	constructor(seed: string) {
		this.temperNoise = new SimplexNoise(`temperature:${seed}`);
		this.wetNoise = new SimplexNoise(`wet:${seed}`);
	}

	/**
	 * get average temperature at (x,y)
	 */
	private getTemperature(x: number, y: number) {
		const a = x / BiomePicker.SCALE_RATIO;
		const b = y / BiomePicker.SCALE_RATIO;
		return (this.temperNoise.noise2D(a, b) + 1) / 2;
	}

	/**
	 * get average wet at (x,y)
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
