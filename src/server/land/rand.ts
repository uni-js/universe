import Random from "seedrandom";

export class RandPicker {
    private x = 1;
    constructor(private seed: string) { }

    nextRand() {
        return Random.xorshift7(`${this.seed}:${this.x++}`)();
    }
}