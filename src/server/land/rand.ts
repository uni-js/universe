import SimplexNoise from "simplex-noise";

export class RandPicker {
    private noise: SimplexNoise
    private x = 0;
    constructor(seed: string) {
        this.noise = new SimplexNoise(seed);
    }

    nextRand() {
        return (this.noise.noise2D(this.x += 5,0) + 1) / 2;
    }
}