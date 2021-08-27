import { Actor } from '../shared/entity';

export class Player extends Actor {
	connId: string;
	playerName: string = 'Player';
	isPlayer: boolean = true;
	usedLands: string[] = [];
	spawnedActors: number[] = [];
}
