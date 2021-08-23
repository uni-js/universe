import { Brick } from './brick';
import { BrickType } from './types';

export class Grass extends Brick {
	static brickType = BrickType.GRASS;
}

export class Dirt extends Brick {
	static brickType = BrickType.DIRT;
}

export class Ice extends Brick {
	static brickType = BrickType.ICE;
}

export class Rock extends Brick {
	static brickType = BrickType.ROCK;
}

export class Sand extends Brick {
	static brickType = BrickType.SAND;
}

export class Water extends Brick {
	static brickType = BrickType.WATER;
}

export class WetDirt extends Brick {
	static brickType = BrickType.WET_DIRT;
}

export class DryDirt extends Brick {
	static brickType = BrickType.DRY_DIRT;
}
