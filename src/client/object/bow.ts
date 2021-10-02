import { ActorType } from '../../shared/actor';
import { ActorObject } from '../shared/actor';
import { TextureProvider } from '../texture';

export class Bow extends ActorObject {
	constructor(
		option: {
			serverId: number;
		},
		texture: TextureProvider,
	) {
		super(
			{
				serverId: option.serverId,
				width: 0.5,
				height: 0.5,
				posX: 0,
				posY: 0,
			},
			ActorType.BOW,
			texture,
		);
	}
}
