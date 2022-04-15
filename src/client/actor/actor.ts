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
import { orderObject } from './order';
import { ShadowObject } from '../objects/shadow';

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

export abstract class ActorObject extends GameObject {
	protected shadow: ShadowObject;
	protected sprite: PIXI.AnimatedSprite;
	protected spriteContainer: PIXI.Container = new PIXI.Container();
	protected nametag: NameTag;
	protected healthBar: HealthBar;

	public direction : DirectionType = undefined;
	public running : RunningType = undefined;
	public size: Vector2;
	public health = 100;
	public showHealth = false;
	public hasShadow = false;
	public attachPos: Vector2;
	public tagname = '';

	private playing = false;
	private attachingActorId: number;
	private attachment: number;
	private moveHandler;

	protected textureProvider: TextureProvider;
	protected app: GameClientApp;
	protected eventBus: EventBusClient;
	protected world: World;
	protected texturesPool : PIXI.Texture[] = [];

	constructor(serverId: number, pos: Vector2, attrs: ActorAttrs, app: GameClientApp) {
		super(serverId);
		this.app = app;
		this.zIndex = 2;
		this.eventBus = this.app.eventBus;
		this.textureProvider = this.app.textureProvider;
		this.size = new Vector2(attrs.sizeX, attrs.sizeY);

		if (attrs.maxHealth) {
			this.healthBar = new HealthBar();
			this.addChild(this.healthBar);
		}
		this.nametag = new NameTag();
		this.sprite = new PIXI.AnimatedSprite([GetEmptyTexture()]);
		this.spriteContainer.addChild(this.sprite);

		this.addChild(this.spriteContainer);
		this.addChild(this.nametag);

		this.moveHandler = new MoveInterpolator(6);
		this.moveHandler.on('position', this.handleHandledPosition.bind(this));

		this.setAnchor(new Vector2(attrs.anchorX, attrs.anchorY));
		this.setTagname(attrs.tagname || '');

		this.position.set(pos.x, pos.y);

		this.updateTexturePool();
		this.setTextures(this.getDefaultTexture());

		this.updateAttrs(attrs);
		this.updateSize();
	}

	abstract getType(): ActorType;

	private updateTexturePool() {
		this.texturesPool = this.textureProvider.getGroup(`actor.${this.getType()}`);
		if (!this.texturesPool || this.texturesPool.length <= 0) {
			this.texturesPool = [this.textureProvider.get(`actor.${this.getType()}`)];
		}
	}

	protected getDefaultTexture() {
		return this.texturesPool[0];
	}

	private handleHandledPosition(pos: Vector2) {
		this.position.set(pos.x, pos.y);
	}

	protected stopAnimate() {
		if (!this.playing) return;

		this.sprite.stop();
		this.sprite.gotoAndStop(0);
		this.setTextures(this.getDefaultTexture());
		this.playing = false;
	}

	protected playAnimate(frames: PIXI.Texture[]) {
		if (this.playing) return;

		this.setTextures(frames);

		this.sprite.play();
		this.playing = true;
	}

	isPlayer() {
		return this.getType() === ActorType.PLAYER;
	}

	getPos() {
		return new Vector2(this.position.x, this.position.y);
	}

	setPos(vec2: Vector2) {
		this.position.set(vec2.x, vec2.y);
	}

	setTagname(tagname: string) {
		this.tagname = tagname;
		this.nametag.text = this.tagname;

		this.updateSize();
	}

	setAnchor(vec2: Vector2) {
		this.sprite.anchor.set(vec2.x, vec2.y);
	}

	setTextures(textures: PIXI.Texture<PIXI.Resource>[] | PIXI.Texture) {
		if (textures === undefined) {
			return;
		}
		if (!Array.isArray(textures)) {
			textures = [textures];
		}
		if (textures.length <= 0) return;

		this.sprite.texture = textures[0];
		this.sprite.textures = textures;
		this.sprite.stop();
		if (this.playing) {
			this.sprite.play();
		}

		this.updateSize();
	}

	getTextures() {
		return this.sprite.textures;
	}

	setAttaching(attachingActor: number) {
		this.attachingActorId = attachingActor;
		this.setAnchor(new Vector2(0.5, 0.5));
	}

	setShowHealth(val: boolean) {
		this.showHealth = val;
		this.updateShowHealth();
	}

	private updateShowHealth() {
		if (this.showHealth && !this.healthBar) {
			this.healthBar = new HealthBar();
			this.addChild(this.healthBar);
		} else if (!this.showHealth && this.healthBar) {
			this.removeChild(this.healthBar);
		}
	}

	setHasShadow(val: boolean) {
		if (val && !this.hasShadow) {
			this.shadow = new ShadowObject(this.textureProvider);
			this.addChild(this.shadow);
		}
		this.hasShadow = val;
		this.updateSize();
	}

	setMaxHealth(maxHealth: number) {
		if(!this.healthBar) {
			return;
		}
		this.healthBar.maxHealth = maxHealth;
	}

	setHealth(health: number) {
		if (this.nametag) {
			this.nametag.hiddenTicks = 100;
		}

		if (this.healthBar) {
			this.healthBar.showTicks = 100;
			this.healthBar.healthValue = health;
		}
	}

	addMovePoint(point: Vector2) {
		this.moveHandler.addMovePoint(point);
	}

	getAttachmentActor() {
		return this.app.actorManager.getActor(this.attachment);
	}

	getAttachingActor() {
		return this.app.actorManager.getActor(this.attachingActorId);
	}

	setRunning(running: RunningType) {
		if (this.running === running) {
			return false;
		}
		this.running = running;
		return true;
	}

	setDirection(direction: DirectionType) {
		if (this.direction === direction) {
			return false;
		}
		this.direction = direction;
		return true;
	}

	private doUpdateAttachmentTick() {
		const actor = this.app.actorManager.getActor(this.attachment);
		if (!actor) {
			return;
		}
		actor.setPos(this.getPos().add(this.attachPos));
	}

	private updateSize() {
		this.sprite.width = this.size.x;
		this.sprite.height = this.size.y;

		if (this.shadow) {
			this.shadow.setSize(this.size.x);
		}

		this.nametag.style.fontSize = 1;
		this.nametag.scale.set(0.4, 0.4);
		this.nametag.position.set(0, -this.size.y - 0.2);

		if (this.healthBar) {
			this.healthBar.position.set(0, -this.size.y - 0.2);
		}
	}


	updateAttrs(attrs: any) {
		for (const attr in attrs) {
			const setter = (<any>this)[`set${attr[0].toUpperCase()}${attr.slice(1)}`];
			if(setter) {
				setter.call(this, attrs[attr])
			} else {
				(<any>this)[attr] = attrs[attr];
			}
		}
	}

	private doOrderTick() {
		if (this.attachingActorId !== undefined) {
			const actor = this.getAttachingActor();
			const offset = (actor.direction === DirectionType.BACK ? -1 : 1) * 0.000000001;
			this.zIndex = actor.zIndex + offset;
			return;
		}

		orderObject(this);
	}

	doTick(tick: number) {
		this.moveHandler.doTick();
		this.nametag && this.nametag.doTick();
		this.healthBar && this.healthBar.doTick();

		this.doUpdateAttachmentTick();
		this.doOrderTick();
	}
}

export type ActorAttrs = any;
