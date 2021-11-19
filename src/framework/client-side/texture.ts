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

export interface TextureItem {
	isJsonUrl: boolean;
	url: string;
	textures: PIXI.Texture[];
}

@injectable()
export class TextureProvider {
	private textures = new Map<string, TextureItem>();
	constructor() {}

	async add(name: string, url: string) {
		const resource = await LoadResource(url);
		const texture = resource.texture;
		this.textures.set(name, { url, isJsonUrl: false, textures: [texture] });
	}

	async addJSON(name: string, json_url: string) {
		const resource = await LoadResource(json_url);
		this.textures.set(name, { url: json_url, isJsonUrl: true, textures: Object.values(resource.textures) });
	}

	getGroup(name_pattern: string, count: number) {
		const group = [];
		for (let order = 0; order < count; order++) {
			const name = Pupa(name_pattern, { order });
			const texture = this.getOne(name);
			if (!texture) return;
			group.push(texture);
		}
		return group;
	}

	get(name: string): PIXI.Texture[] | undefined {
		if (!this.textures.has(name)) return;

		return this.textures.get(name)?.textures;
	}

	getOne(name: string): PIXI.Texture | undefined {
		const textures = this.get(name);
		if (!textures || !textures[0]) return;

		return textures[0];
	}

	getItem(name: string) {
		return this.textures.get(name);
	}
}

/**
 * resolve a texture path
 *
 * @returns [textureKey, texturePath, textureType]
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
