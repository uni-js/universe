import * as PIXI from 'pixi.js';

import { ActorType, AttachMapping, Direction, RunningState } from '../../shared/actor';
import { GameEvent } from '../event';
import { GameObject } from './game-object';
import { GetEmptyTexture, TextureProvider } from '../texture';
import { Interpolate2d, Vector2 } from '../../server/shared/math';
import { EventEmitter2 } from 'eventemitter2';
import { Factory, FactoryMapper } from '../../shared/factory';

/**
 * 用于平滑处理移动同步包
 */
export class MoveInterpolator extends EventEmitter2 {
	/**
	 * 缓存的目标点
	 *
	 */
	private movePoints: Vector2[] = [];
	private locatedAt = 0;
	private perTicks = 3;

	constructor(private maxTick: number) {
		super();
	}

	addMovePoint(target: Vector2) {
		this.movePoints.push(target);
		if (this.movePoints.length > 10) {
			this.movePoints.shift();
		}
	}
	doTick() {
		if (this.movePoints.length >= 2) {
			const curr = this.movePoints[0];
			const target = this.movePoints[1];

			const point = Interpolate2d([curr, target], this.locatedAt / this.perTicks);
			this.emit('position', point);

			this.locatedAt++;
			if (this.locatedAt === this.perTicks) {
				this.locatedAt = 0;
				this.movePoints.shift();
			}
		} else if (this.movePoints.length == 1) {
			this.emit('position', this.movePoints[0]);
		}
	}
}

export interface Attachment {
	key: string;
	relativePos?: Vector2;
	actorId: number;
}

export class ActorObject extends GameObject {
	private moveInterpolator;

	protected isStatesDirty = true;

	protected shadow;
	protected sprite;
	protected nametag: PIXI.Text;

	protected direction: Direction = Direction.BACK;
	protected running: RunningState = RunningState.SILENT;

	protected usedTextures: PIXI.Texture[] = [];
	private walkTextureIndex: number;

	private pos: Vector2;
	private size: Vector2;
	private tagname = '';

	private playing = false;

	private attachments = new Map<string, Attachment>();
	private attaching?: Attachment;

	private attachMapping?: AttachMapping;

	protected isUsing = false;
	private isUsingDirty = false;

	constructor(
		serverId: number,
		option: ActorCtorOption,
		size: Vector2,
		actorType: ActorType,
		texture: TextureProvider,
		usedTextureLength = 0,
		canWalk = false,
		walkTextureIndex = 0,
	) {
		super(texture, serverId);

		this.pos = new Vector2(option.posX, option.posY);
		this.size = size;

		this.sprite = new PIXI.AnimatedSprite([GetEmptyTexture()]);

		this.usedTextures =
			this.texture.get(`actor.${actorType}`) || this.texture.getGroup(`actor.${actorType}.{order}`, usedTextureLength);

		this.nametag = new PIXI.Text('');
		this.nametag.style = new PIXI.TextStyle({
			fill: 'white',
		});

		this.moveInterpolator = new MoveInterpolator(6);
		this.moveInterpolator.on('position', this.handleInterpolatedPosition.bind(this));

		if (option.tagname) {
			this.setTagName(option.tagname);
		}

		this.addChildAt(this.nametag, 0);
		this.addChildAt(this.sprite, 1);

		if (canWalk) {
			this.walkTextureIndex = walkTextureIndex;
			this.shadow = new PIXI.Sprite(this.texture.getOne('system.shadow'));
			this.addChildAt(this.shadow, 2);
		}

		if (option.attachments) {
			option.attachments.forEach((attachment) => {
				this.setAttachment(attachment.key, attachment.actorId);
			});
		}

		if (option.attaching) {
			this.setAttaching(option.attaching.key, option.attaching.actorId);
		}

		if (option.attachMapping) {
			this.attachMapping = option.attachMapping;
		}

		if (option.isUsing) {
			this.startUsing();
		} else if (this.isUsing) {
			this.endUsing();
		}

		this.setDirection(Direction.FORWARD);

		this.setPosition(this.pos);
		this.resize();
	}
	private handleInterpolatedPosition(pos: Vector2) {
		this.setPosition(pos);
	}
	getRunning() {
		return this.running;
	}
	getDirection() {
		return this.direction;
	}
	setRunning(running: RunningState, dirty = true) {
		if (this.running == running) return;

		this.running = running;
		if (running == RunningState.SILENT) {
			this.stopAnim();
		} else if (running == RunningState.RUNNING) {
			this.playAnim();
		} else if (running == RunningState.WALKING) {
			this.playAnim();
		}

		if (dirty) this.isStatesDirty = true;
	}

	setAnimateSpeed(speed: number) {
		this.sprite.animationSpeed = speed;
	}
	stopAnim() {
		if (!this.playing) return;

		this.sprite.stop();
		this.resetAnim();
		this.playing = false;
	}
	playAnim() {
		if (this.playing) return;

		this.sprite.play();
		this.playing = true;
	}
	resetAnim() {
		this.sprite.gotoAndStop(0);
	}

	setPosition(position: Vector2) {
		this.pos = position.clone();
		this.position.set(this.pos.x, this.pos.y);
	}
	setDirection(direction: Direction, dirty = true) {
		this.direction = direction;

		if (dirty) this.isStatesDirty = true;
	}
	protected getDirectionTextures(dir: Direction) {
		const index = this.walkTextureIndex;

		if (dir == Direction.FORWARD) {
			return this.usedTextures.slice(index + 0, index + 3);
		} else if (dir == Direction.LEFT) {
			return this.usedTextures.slice(index + 3, index + 6);
		} else if (dir == Direction.RIGHT) {
			return this.usedTextures.slice(index + 6, index + 9);
		} else if (dir == Direction.BACK) {
			return this.usedTextures.slice(index + 9, index + 12);
		} else return [];
	}

	setTagName(tagname: string) {
		this.tagname = tagname;
		this.nametag.text = this.tagname;

		this.resize();
	}
	private resize() {
		this.sprite.width = this.size.x;
		this.sprite.height = this.size.y;

		if (this.shadow) {
			const shadowBounds = this.shadow.getLocalBounds();
			const shadowRatio = shadowBounds.height / shadowBounds.width;

			this.shadow.width = this.size.x;
			this.shadow.height = this.size.x * shadowRatio;
			this.shadow.position.set(0, -0.15);
		}

		this.nametag.style.fontSize = 1;
		this.nametag.scale.set(0.5, 0.5);

		this.nametag.position.set(0, -this.size.y - 0.2);
	}
	setAnchor(x: number, y: number) {
		this.sprite.anchor.set(x, y);
		this.shadow && this.shadow.anchor.set(0.5, 0.5);
		this.nametag && this.nametag.anchor.set(0.5, 0.5);
	}
	setTextures(textures: PIXI.Texture[]) {
		this.sprite.textures = textures;
		this.sprite.stop();
		if (this.playing) {
			this.sprite.play();
		}

		this.resize();
	}

	getPosition() {
		return this.pos;
	}

	addMovePoint(point: Vector2) {
		this.moveInterpolator.addMovePoint(point);
	}

	getAttachRelPos(key: string) {
		const keyMapped = this.attachMapping && this.attachMapping[key];
		const mappedRelPos = keyMapped && keyMapped[this.getDirection()];
		const relPos = mappedRelPos ? new Vector2(mappedRelPos[0], mappedRelPos[1]) : new Vector2(0, 0);
		return relPos;
	}

	/**
	 * 设置附着物
	 */
	setAttachment(key: string, actorId: number) {
		this.attachments.set(key, { key, relativePos: this.getAttachRelPos(key), actorId });
	}

	setAttaching(key: string, actorId: number) {
		this.attaching = { key, actorId };
		this.zIndex = 3;
		this.setAnchor(0.5, 0.5);
	}

	getAttaching() {
		return this.attaching;
	}

	removeAttachment(key: string) {
		this.attachments.delete(key);
	}

	getAttachment(key: string) {
		return this.attachments.get(key);
	}

	getIsUsing() {
		return this.isUsing;
	}

	startUsing(dirty = true) {
		this.isUsing = true;
		if (dirty) {
			this.isUsingDirty = true;
		}
	}

	endUsing(dirty = true) {
		this.isUsing = false;
		if (dirty) {
			this.isUsingDirty = true;
		}
	}

	async doTick(tick: number) {
		this.moveInterpolator.doTick();

		if (this.isUsingDirty) {
			this.emit(GameEvent.ActorToggleUsingEvent, this.serverId, this.isUsing ? true : false);
			this.isUsingDirty = false;
		}

		if (this.isStatesDirty) {
			this.emit(GameEvent.ActorToggleWalkEvent, this);
			this.isStatesDirty = false;
		}
	}
}

export interface ActorCtorOption {
	posX: number;
	posY: number;
	width: number;
	height: number;
	attachments: any[];
	tagname?: string;
	[key: string]: any;
}

export type ActorCtor = [number, ActorCtorOption, TextureProvider, ...any];
export class ActorFactory extends Factory<ActorType, ActorObject, ActorCtor> {}

export type ActorFactoryMapper = FactoryMapper<ActorType, ActorObject, ActorCtor>;
