import { Actor } from '../shared/entity';

export class Player extends Actor {
	connId: string;
	playerName = 'Player';
	isPlayer = true;
	usedLands: string[] = [];
	spawnedActors: number[] = [];
}
