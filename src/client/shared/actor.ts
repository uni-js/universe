import * as PIXI from 'pixi.js';

import { ActorType, Direction, RunningState } from '../../shared/actor';
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
		}
	}
}

export class ActorObject extends GameObject {
	private moveInterpolator;
	/**
	 * 设置该状态后,实体会自动过渡到目标位置
	 */
	protected smoothMove = true;
	protected isStatesDirty = true;

	protected shadow;
	protected sprite;
	protected nametag: PIXI.Text;

	protected direction: Direction = Direction.BACK;
	protected running: RunningState = RunningState.SILENT;

	private usedTextures: PIXI.Texture[] = [];
	private walkTextureIndex: number;

	private pos: Vector2;
	private size: Vector2;
	private tagname = '';

	private playing = false;

	constructor(
		option: {
			serverId: number;
			posX: number;
			posY: number;
			width: number;
			height: number;
			canWalk?: boolean;
			walkTextureIndex?: number;
			tagname?: string;
		},
		actorType: ActorType,
		texture: TextureProvider,
	) {
		super(texture, option.serverId);

		this.pos = new Vector2(option.posX, option.posY);
		this.size = new Vector2(option.width, option.height);

		this.sprite = new PIXI.AnimatedSprite([GetEmptyTexture()]);
		this.usedTextures = this.texture.get(`actor.${actorType}`);

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

		if (option.canWalk) {
			this.walkTextureIndex = option.walkTextureIndex;
			this.shadow = new PIXI.Sprite(this.texture.getOne('system.shadow'));
			this.addChildAt(this.shadow, 2);
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
	}
	private resize() {
		this.sprite.width = this.size.x;
		this.sprite.height = this.size.y;

		const shadowBounds = this.shadow.getLocalBounds();
		const shadowRatio = shadowBounds.height / shadowBounds.width;

		this.shadow.width = this.size.x;
		this.shadow.height = this.size.x * shadowRatio;
		this.shadow.position.set(0, -0.15);

		const nametagBounds = this.nametag.getBounds();
		const nametagRatio = nametagBounds.height / nametagBounds.width;

		this.nametag.width = 0.5 / nametagRatio;
		this.nametag.height = 0.5;

		this.nametag.position.set(0, -this.size.y - 0.3);
	}
	setAnchor(x: number, y: number) {
		this.sprite.anchor.set(x, y);
		this.shadow.anchor.set(0.5, 0.5);
		this.nametag.anchor.set(0.5, 0.5);
	}
	setTextures(textures: PIXI.Texture[]) {
		this.sprite.textures = textures;
		this.sprite.stop();
		if (this.playing) {
			this.sprite.play();
		}

		this.resize();
	}
	setSmoothMove(smooth: boolean) {
		this.smoothMove = smooth;
	}
	getPosition() {
		return this.pos;
	}
	getRelativeLoc() {
		return new Vector2(this.position.x, this.position.y);
	}
	addMovePoint(point: Vector2) {
		this.moveInterpolator.addMovePoint(point);
	}
	async doTick(tick: number) {
		this.moveInterpolator.doTick();
		if (this.isStatesDirty) {
			this.emit(GameEvent.SetActorStateEvent, this);
			this.isStatesDirty = false;
		}
	}
}

export type ActorCtor = [any, TextureProvider, ...any];
export class ActorFactory extends Factory<ActorType, ActorObject, ActorCtor> {}

export type ActorFactoryMapper = FactoryMapper<ActorType, ActorObject, ActorCtor>;
