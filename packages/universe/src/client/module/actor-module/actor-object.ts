import * as PIXI from 'pixi.js';

import { ActorType, ActorTypeName, AttachMapping, AttachType, Direction, RunningState } from '../../../server/module/actor-module/spec';
import { GameObject } from '@uni.js/client';
import { TextureProvider } from '@uni.js/texture';
import { Interpolate2d, Vector2 } from '../../../server/shared/math';
import { EventEmitter2 } from 'eventemitter2';
import { Factory, FactoryMapper } from '../../../shared/factory';
import { HealthBar } from './health-bar';
import { NameTag } from './nametag';
import { SERVER_TICKS_MULTIPLE } from '../../../server/shared/server';

import * as Events from '../../event/internal';

function GetEmptyTexture() {
	return PIXI.Texture.fromBuffer(new Uint8Array(1), 1, 1);
}
/**
 * be used to interpolate the move event from server
 */
export class MoveInterpolator extends EventEmitter2 {
	/**
	 * target points cached
	 */
	private movePoints: Vector2[] = [];
	private locatedAt = 0;
	private perTicks = SERVER_TICKS_MULTIPLE;

	constructor(private maxTick: number) {
		super();
	}

	addMovePoint(target: Vector2) {
		this.movePoints.push(target);
		if (this.movePoints.length > 10) {
			this.movePoints.shift();
		}

		if (this.movePoints.length == 1) {
			this.emit('position', this.movePoints[0]);
		}
	}

	doFixedUpdateTick() {
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

export interface Attachment {
	key: AttachType;
	relativePos?: Vector2;
	actorId: number;
}

export class ActorObject extends GameObject {
	/**
	 * @readonly
	 */
	public actorType: ActorType;

	/**
	 * @readonly
	 */
	public isUsing = false;

	/**
	 * @readonly
	 */
	public boundings: number[];

	protected _walkTextures: PIXI.Texture<PIXI.Resource>[] = [];

	protected shadow: PIXI.Sprite;
	protected sprite: PIXI.AnimatedSprite;
	protected spriteContainer: PIXI.Container = new PIXI.Container();
	protected nametag: NameTag;
	protected healthBar: HealthBar;

	protected _direction: Direction = Direction.BACK;
	protected _running: RunningState = RunningState.SILENT;

	private size: Vector2;
	private health = 100;

	private playing = false;
	private _showHealth = false;
	private _canWalk = false;
	private _hasShadow = false;

	private _attaching?: Attachment;
	private attachments = new Map<AttachType, Attachment>();
	private attachMapping?: AttachMapping;

	private isUsingDirty = false;
	private isWalkDirty = false;

	private _tagname = '';

	private moveInterpolator;

	constructor(serverId: number, option: ActorConstructOption, size: Vector2, actorType: ActorType, protected textureProvider: TextureProvider) {
		super(serverId);
		this.size = size;
		this.actorType = actorType;

		this.nametag = new NameTag();
		this.sprite = new PIXI.AnimatedSprite([GetEmptyTexture()]);
		this.spriteContainer.addChild(this.sprite);

		this.addChild(this.nametag);
		this.addChild(this.spriteContainer);

		this.moveInterpolator = new MoveInterpolator(6);
		this.moveInterpolator.on('position', this.handleInterpolated.bind(this));

		this.tagname = option.tagname || '';

		if (option.attachments) {
			option.attachments.forEach((attachment) => {
				this.setAttachment(attachment.key, attachment.actorId);
			});
		}

		if (option.attaching) {
			this.attaching = option.attaching;
		}

		if (option.attachMapping) {
			this.attachMapping = option.attachMapping;
		}

		if (option.isUsing) {
			this.startUsing();
		} else if (this.isUsing) {
			this.endUsing();
		}

		this.boundings = option.boundings;
		this.singleTexture = this.textureProvider.getOne(`actor.${ActorTypeName[actorType]}.normal`);

		this.controlDirection(Direction.FORWARD);

		this.position.set(option.posX, option.posY);
		this.updateSize();
	}

	private handleInterpolated(pos: Vector2) {
		this.position.set(pos.x, pos.y);
	}

	private updateDirectionTextures() {
		if (this._canWalk) {
			let textures: PIXI.Texture[] = [];
			if (this._direction == Direction.FORWARD) {
				textures = this._walkTextures.slice(0, 3);
			} else if (this._direction == Direction.LEFT) {
				textures = this._walkTextures.slice(3, 6);
			} else if (this._direction == Direction.RIGHT) {
				textures = this._walkTextures.slice(6, 9);
			} else if (this._direction == Direction.BACK) {
				textures = this._walkTextures.slice(9, 12);
			}
			textures.push(textures.shift());
			this.textures = textures;
		}
	}

	protected stopAnimate() {
		if (!this.playing) return;

		this.sprite.stop();
		this.resetAnimate();
		this.playing = false;
	}

	protected playAnimate() {
		if (this.playing) return;

		this.sprite.play();
		this.playing = true;
	}

	protected resetAnimate() {
		this.sprite.gotoAndStop(0);
	}

	get vPos() {
		return new Vector2(this.position.x, this.position.y);
	}

	set vPos(vec2: Vector2) {
		this.position.set(vec2.x, vec2.y);
	}

	get tagname() {
		return this._tagname;
	}

	set tagname(tagname: string) {
		this._tagname = tagname;
		this.nametag.text = this._tagname;

		this.updateSize();
	}

	get walkTextures() {
		return this._walkTextures;
	}

	set walkTextures(textures: PIXI.Texture<PIXI.Resource>[]) {
		this._walkTextures = textures;
		this.updateDirectionTextures();
	}

	private updateSize() {
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
		this.nametag.scale.set(0.4, 0.4);
		this.nametag.position.set(0, -this.size.y - 0.2);

		if (this.healthBar) {
			this.healthBar.position.set(0, -this.size.y - 0.2);
		}
	}

	set anchor(vec2: Vector2) {
		this.sprite.anchor.set(vec2.x, vec2.y);

		this.shadow && this.shadow.anchor.set(0.5, 0.5);
		this.nametag && this.nametag.anchor.set(0.5, 0.5);
	}

	set singleTexture(texture: PIXI.Texture<PIXI.Resource>) {
		this.sprite.texture = texture;
	}

	get singleTexture() {
		return this.sprite.texture;
	}

	get spriteRotation() {
		return this.sprite.rotation;
	}

	set spriteRotation(rotation: number) {
		this.sprite.rotation = rotation;
	}

	set textures(textures: PIXI.Texture<PIXI.Resource>[] | PIXI.FrameObject[]) {
		if (textures.length <= 0) return;

		this.sprite.textures = textures;
		this.sprite.stop();
		if (this.playing) {
			this.sprite.play();
		}

		this.updateSize();
	}

	get textures() {
		return this.sprite.textures;
	}

	set attaching(attaching: { key: AttachType; actorId: number }) {
		this._attaching = attaching;
		this.zIndex = 3;
		this.anchor = new Vector2(0.5, 0.5);
	}

	get attaching() {
		return this._attaching;
	}

	get showHealth() {
		return this._showHealth;
	}

	set showHealth(val: boolean) {
		this._showHealth = val;
		this.updateShowHealth();
	}

	private updateShowHealth() {
		if (this._showHealth && !this.healthBar) {
			this.healthBar = new HealthBar();
			this.addChild(this.healthBar);
		} else if (!this._showHealth && this.healthBar) {
			this.removeChild(this.healthBar);
		}
	}

	set hasShadow(val: boolean) {
		if (val && !this._hasShadow) {
			this.shadow = new PIXI.Sprite(this.textureProvider.getOne('system.shadow'));
			this.shadow.anchor.set(0.5, 0.5);
			this.addChild(this.shadow);
		}
		this._hasShadow = val;
		this.updateSize();
	}

	set canWalk(val: boolean) {
		this._canWalk = val;
	}

	addMovePoint(point: Vector2) {
		this.moveInterpolator.addMovePoint(point);
	}

	getAttachRelPos(key: AttachType) {
		const keyMapped = this.attachMapping && this.attachMapping[key];
		const mappedRelPos = keyMapped && keyMapped[this._direction];
		const relPos = mappedRelPos ? new Vector2(mappedRelPos[0], mappedRelPos[1]) : new Vector2(0, 0);
		return relPos;
	}

	removeAttachment(key: AttachType) {
		this.attachments.delete(key);
	}

	getAttachment(key: AttachType) {
		return this.attachments.get(key);
	}

	setAttachment(key: AttachType, actorId: number) {
		this.attachments.set(key, {
			key,
			relativePos: this.getAttachRelPos(key),
			actorId,
		});
	}

	startUsing(dirty = true) {
		if (this.isUsing == true) return;

		this.isUsing = true;
		if (dirty) {
			this.isUsingDirty = true;
		}
	}

	endUsing(dirty = true) {
		if (this.isUsing == false) return;

		this.isUsing = false;
		if (dirty) {
			this.isUsingDirty = true;
		}
	}

	damage(val: number) {
		if (this.nametag) {
			this.nametag.hiddenTicks = 100;
		}

		if (this.healthBar) {
			this.healthBar.showTicks = 100;
			this.healthBar.healthValue = val;
		}
		this.health = val;
	}

	get direction() {
		return this._direction;
	}

	set direction(direction: Direction) {
		if (this._direction == direction) return;

		this._direction = direction;
		this.updateDirectionTextures();
	}

	controlDirection(direction: Direction) {
		if (this.direction == direction) return;

		this.direction = direction;
		this.isWalkDirty = true;
	}

	get running() {
		return this._running;
	}

	set running(running: RunningState) {
		if (this._running == running) return;

		this._running = running;

		if (this._canWalk) {
			if (running == RunningState.SILENT) {
				this.stopAnimate();
			} else if (running == RunningState.RUNNING) {
				this.playAnimate();
			} else if (running == RunningState.WALKING) {
				this.playAnimate();
			}
		}
	}

	controlRunning(running: RunningState) {
		if (this.running == running) return;

		this.running = running;
		this.isWalkDirty = true;
	}

	doFixedUpdateTick(tick: number) {
		this.moveInterpolator.doFixedUpdateTick();
		this.nametag && this.nametag.doFixedUpdateTick();
		this.healthBar && this.healthBar.doFixedUpdateTick();

		if (this.isUsingDirty) {
			this.emitEvent(Events.ActorToggleUsingEvent, { actorId: this.serverId, startOrEnd: this.isUsing ? true : false });
			this.isUsingDirty = false;
		}

		if (this.isWalkDirty) {
			this.emitEvent(Events.ActorToggleWalkEvent, {
				actorId: this.serverId,
				running: this.running,
				direction: this.direction,
			});
			this.isWalkDirty = false;
		}
	}
}

export interface ActorConstructOption {
	posX: number;
	posY: number;
	width: number;
	height: number;
	attachments: any[];
	tagname?: string;
	[key: string]: any;
}

export type ActorCtor = [number, ActorConstructOption, TextureProvider, ...any];
export type ActorFactoryMapper = FactoryMapper<ActorType, ActorObject, ActorCtor>;

export class ActorFactory extends Factory<ActorType, ActorObject, ActorCtor> {}
