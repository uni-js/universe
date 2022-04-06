import * as PIXI from 'pixi.js';

import { EventBusClient, GameObject } from '@uni.js/client';
import { TextureProvider } from '@uni.js/texture';
import { EventEmitter2 } from 'eventemitter2';
import { HealthBar } from '../objects/health-bar';
import { NameTag } from '../objects/nametag';
import { Vector2 } from '../../server/utils/vector2';
import { Interpolate2d } from '../../server/utils/interpolate';
import { ActorType } from '../../server/actor/actor-type';
import { DirectionType, RunningType } from '../../server/actor/actor';
import type { GameClientApp } from '../client-app';
import type { World } from '../world/world';

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
	private perTicks = 3;

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

export abstract class ActorObject extends GameObject {
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

	protected _direction = DirectionType.BACK;
	protected _running = RunningType.SILENT;

	private size: Vector2;
	private health = 100;

	private playing = false;
	private _showHealth = false;
	private _canWalk = false;
	private _hasShadow = false;

	private _attachingActorId: number;

	private attachment: number;
	private attachPos: Vector2;

	private _tagname = '';

	private moveInterpolator;
	protected textureProvider: TextureProvider;
	protected app: GameClientApp;
	protected eventBus: EventBusClient;
	protected world: World;

	constructor(serverId: number, pos: Vector2, attrs: ActorAttrs, app: GameClientApp) {
		super(serverId);
		this.app = app;
		this.eventBus = this.app.eventBus;
		this.textureProvider = this.app.textureProvider;
		this.size = new Vector2(attrs.sizeX, attrs.sizeY);

		this.nametag = new NameTag();
		this.sprite = new PIXI.AnimatedSprite([GetEmptyTexture()]);
		this.spriteContainer.addChild(this.sprite);

		this.addChild(this.nametag);
		this.addChild(this.spriteContainer);

		this.moveInterpolator = new MoveInterpolator(6);
		this.moveInterpolator.on('position', this.handleInterpolated.bind(this));

		this.singleTexture = this.getDefaultTexture();

		this.tagname = attrs.tagname || '';
		this.direction = attrs.direction;
		this.boundings = attrs.boundings;

		this.position.set(pos.x, pos.y);
		this.updateSize();
	}

	abstract getType(): ActorType;

	isPlayer() {
		return this.getType() === ActorType.PLAYER;
	}

	protected getDefaultTexture() {
		return this.textureProvider.get(`actor.${this.getType()}`);
	}

	protected getDefaultTextureGroup() {
		return this.textureProvider.getGroup(`actor.${this.getType()}`);
	}

	private handleInterpolated(pos: Vector2) {
		this.position.set(pos.x, pos.y);
	}

	private updateDirectionTextures() {
		if (this._canWalk) {
			let textures: PIXI.Texture[] = [];
			if (this._direction == DirectionType.FORWARD) {
				textures = this._walkTextures.slice(0, 3);
			} else if (this._direction == DirectionType.LEFT) {
				textures = this._walkTextures.slice(3, 6);
			} else if (this._direction == DirectionType.RIGHT) {
				textures = this._walkTextures.slice(6, 9);
			} else if (this._direction == DirectionType.BACK) {
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

	set attaching(attachingActor: number) {
		this._attachingActorId = attachingActor;
		this.zIndex = 3;
		this.anchor = new Vector2(0.5, 0.5);
	}

	get attaching() {
		return this._attachingActorId;
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
			this.shadow = new PIXI.Sprite(this.textureProvider.get('system.shadow'));
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

	getAttachmentActor() {
		return this.app.actorManager.getActor(this.attachment);
	}

	getAttachingActor() {
		return this.app.actorManager.getActor(this.attaching);
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

	set direction(direction: DirectionType) {
		if (this._direction == direction) return;

		this._direction = direction;
		this.updateDirectionTextures();
	}

	get running() {
		return this._running;
	}

	set running(running: RunningType) {
		if (this._running == running) return;

		this._running = running;

		if (this._canWalk) {
			if (running == RunningType.SILENT) {
				this.stopAnimate();
			} else if (running == RunningType.RUNNING) {
				this.playAnimate();
			} else if (running == RunningType.WALKING) {
				this.playAnimate();
			}
		}
	}

	private doUpdateAttachmentTick() {
		const actor = this.app.actorManager.getActor(this.attachment);
		if (!actor) {
			return;
		}

		actor.vPos = this.vPos.add(this.attachPos);
	}

	updateAttrs(attrs: any) {
		for (const attr in attrs) {
			(<any>this)[attr] = attrs[attr];
		}
	}

	doFixedUpdateTick(tick: number) {
		this.moveInterpolator.doFixedUpdateTick();
		this.nametag && this.nametag.doFixedUpdateTick();
		this.healthBar && this.healthBar.doFixedUpdateTick();

		this.doUpdateAttachmentTick();
	}
}

export type ActorAttrs = any;
