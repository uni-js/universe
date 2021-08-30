import { injectable } from 'inversify';
import * as PIXI from 'pixi.js';
import * as Path from 'path';
import Pupa from 'pupa';

export enum TextureType {
	IMAGE,
	IMAGESET,
}

export function GetEmptyTexture() {
	return PIXI.Texture.fromBuffer(new Uint8Array(1), 1, 1);
}

export async function LoadResource(url: string) {
	const loader = new PIXI.Loader();
	loader.add('resource', url);

	const resource = await new Promise<PIXI.ILoaderResource>((resolve, reject) => {
		loader.load((loader, resources) => {
			resolve(resources['resource']);
		});
	});

	return resource;
}

@injectable()
export class TextureContainer {
	private textures = new Map<string, PIXI.Texture[]>();
	constructor() {}
	async add(name: string, url: string) {
		const resource = await LoadResource(url);
		const texture = resource.texture;
		this.textures.set(name, [texture]);
	}
	async addJSON(name: string, json_url: string) {
		const resource = await LoadResource(json_url);
		this.textures.set(name, Object.values(resource.textures));
	}
	/**
	 * 增加一组被编号的材质
	 * 一般用于动画帧
	 *
	 * 请注意 name的格式如 texture.player.{order}
	 *
	 * url_pattern的格式如 ./textures/player/{order}.png
	 */
	async addGroup(name_pattern: string, url_pattern: string, count: number) {
		for (let order = 0; order < count; order++) {
			const name = Pupa(name_pattern, { order });
			const url = Pupa(url_pattern, { order });

			await this.add(name, url);
		}
	}
	/**
	 * 取出一组被编号的材质
	 */
	getGroup(name_pattern: string, count: number) {
		const group = [];
		for (let order = 0; order < count; order++) {
			const name = Pupa(name_pattern, { order });
			const texture = this.get(name);
			if (!texture) return;
			group.push(texture);
		}
		return group;
	}
	get(name: string) {
		if (!this.textures.has(name)) throw new Error(`该材质不存在 ${name}`);

		return this.textures.get(name);
	}
	getOne(name: string) {
		const textures = this.get(name);
		if (!textures[0]) throw new Error(`该材质不存在 ${name} at index [0]`);

		return textures[0];
	}
}

/**
 * 解析一个材质地址
 *
 * @returns [材质的key, 材质的路径, 材质的类型]
 */
export function ParseTexturePath(texturePath: string): [string, string, TextureType] | undefined {
	const relPath = Path.join('texture', texturePath);
	const parsed = Path.parse(texturePath);

	const splited = parsed.name.split('.');

	const isSet = splited[splited.length - 1] == 'set';
	const isSetJson = parsed.ext === '.json';

	if (isSet) {
		const setName = splited.slice(0, splited.length - 1).join('.');
		const joined = Path.join(Path.dirname(parsed.dir), setName);
		const key = joined.replace(new RegExp('/', 'g'), '.');

		if (isSetJson) return [key, relPath, TextureType.IMAGESET];
	} else {
		const joined = Path.join(parsed.dir, parsed.name);
		const key = joined.replace(new RegExp('/', 'g'), '.');

		return [key, relPath, TextureType.IMAGE];
	}
}
