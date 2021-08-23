import Color from 'color';
import * as PIXI from 'pixi.js';

export function GetPureColorTexture(color_name: string, size: number) {
	const color = Color(color_name).rgb().unitArray();

	const buffer = new Float32Array(size * size * 4);
	for (let i = 0; i < size * size; i++) {
		buffer[i] = color[0];
		buffer[i + 1] = color[1];
		buffer[i + 2] = color[2];
		buffer[i + 3] = 1;
	}
	return PIXI.Texture.fromBuffer(buffer, size, size);
}
