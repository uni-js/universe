import { BiomePicker, BiomeType } from './biome';
import { expose } from 'threads/worker';
import { Vector2 } from '../utils/vector2';
import type { LandData } from './land';
import { BrickData, BrickType } from '../bricks';
import { generateHeightMap, HeightMapValue } from './height-map';
import SimplexNoise from 'simplex-noise';
import { RandPicker } from './rand';

function pickMetaProb(metaProb: number[], val: number) {
	if (!metaProb) {
		return 0;
	}
	let sum = 0;
	let index = 0;
	for(let prob of metaProb) {
		sum += prob;
		if (val <= sum) {
			return index;
		}
		index++;
	}
	return metaProb.length - 1;
}

expose({
	GenerateLandData(landX: number, landY: number, seed = 'seed'): LandData {
		const landPos = new Vector2(landX, landY);
		const heightMap = generateHeightMap(seed, landX, landY);
		const bricks: BrickData[] = [];
		for (let y = 0; y < 32; y++)
			for (let x = 0; x < 32; x++) {
				const layers: BrickType[] = [];
				const metas: number[] = [];
				for(let layer = 0; layer < 10; layer++) {
					let brickType: BrickType;
					const heightMapValue = heightMap.getValue(x, y, layer);
					if (heightMapValue === HeightMapValue.ROCK)  {
						brickType = BrickType.ROCK
					} else if(heightMapValue === HeightMapValue.WATER) {
						brickType = BrickType.WATER
					} else {
						break;
					}

					layers.push(brickType);
					metas.push(0);
				}

				bricks.push({
					x,
					y,
					layers,
					metas
				});
			}

		const startAt = landPos.mul(32);
		const picker = new BiomePicker(seed);
		const metaPicker = new RandPicker(`meta:${seed}`);

		for (let y = 0; y < 32; y++)
			for (let x = 0; x < 32; x++) {
				const type = picker.getBiomeType(startAt.x + x, startAt.y + y);
				let topLayer: BrickType;
				let metaProb: number[] = null;
				let fillLayer: BrickType = BrickType.ROCK;
				switch (type) {
					case BiomeType.ICELAND:
					case BiomeType.COLD:
						topLayer = BrickType.ICE
						break;
					case BiomeType.DESERT:
						topLayer = BrickType.SAND;
						break;
					case BiomeType.DRY:
						topLayer = BrickType.DRY_DIRT;
						fillLayer = BrickType.DIRT;
						break;
					case BiomeType.RAINFOREST:
					case BiomeType.PLAIN:
					case BiomeType.FOREST:
						topLayer = BrickType.GRASS
						fillLayer = BrickType.DIRT;
						metaProb = [0.8, 0.1, 0.05, 0.03, 0.2];
						break;
					case BiomeType.LAKE:
						topLayer = BrickType.WATER;
						fillLayer = BrickType.DIRT;
						break;
					case BiomeType.MOUNTAIN:
						topLayer = BrickType.ROCK;
						break;
				}
				
				const layers = bricks[y * 32 + x].layers;
				const metas = bricks[y * 32 + x].metas;

				let topLayerIndex = null;
				for (let l = layers.length - 1; l > 0; l--) {
					if (layers[l] === BrickType.ROCK) {
						topLayerIndex = l;
					} else if (topLayerIndex === null) {
						continue;
					}

					const isTopLayer = l === topLayerIndex;
					const isFillLayer = l < topLayerIndex && l > topLayerIndex - 3
					if (isTopLayer) {
						layers[l] = topLayer

						metas[l] = pickMetaProb(metaProb, metaPicker.nextRand());
					} else if(isFillLayer) {
						layers[l] = fillLayer
					}
				}
			}
		
		return {
			bricks,
		};
	},
});
