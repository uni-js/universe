import SimplexNoise from "simplex-noise";


export enum HeightMapValue {
    AIR,
    ROCK,
    WATER
}

export const SEA_LEVEL = 2;

export class HeightMap{
    constructor(private data: Uint8Array) {

    }

    getValue(x: number, y: number, layer: number): HeightMapValue {
        const index = (y * 32 + x) * 10 + layer;
        return this.data[index];
    }

}

export function generateHeightMap(seed: string, landX: number, landY: number) {
    const heightMap = new Uint8Array(32 * 32 * 10);
    const noise = new SimplexNoise(`seed:${seed}`);

    for(let y = 0; y < 32; y++) {
        for(let x = 0; x < 32; x++) {
            const posX = landX * 32 + x;
            const posY = landY * 32 + y;
            for(let layer = 0; layer < 10; layer++) {
                const index = (y * 32 + x) * 10 + layer;
                const val = noise.noise3D(posX / 100, layer * 10, posY / 100);
                if (val > 0) {
                    heightMap[index] = HeightMapValue.ROCK;
                } else if (layer <= SEA_LEVEL) {
                    heightMap[index] = HeightMapValue.WATER;
                } else {
                    heightMap[index] = HeightMapValue.AIR;
                }
            }
        }
    }

    return new HeightMap(heightMap);
}