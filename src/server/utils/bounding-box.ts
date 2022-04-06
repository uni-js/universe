import SAT from 'sat';
import { Vector2 } from './vector2';

export function calcBoundingBox(pos: Vector2, boundings: number[]): [number, number, number, number] {
	const fromX = pos.x + boundings[0];
	const fromY = pos.y + boundings[1];
	const toX = pos.x + boundings[2];
	const toY = pos.y + boundings[3];

	return [fromX, fromY, toX, toY];
}

export function calcBoundingSATBox(pos: Vector2, boundings: number[]) {
	const [fromX, fromY, toX, toY] = calcBoundingBox(pos, boundings);
	return new SAT.Box(new SAT.Vector(fromX, fromY), toX - fromX, toY - fromY);
}
