import SAT from 'sat';
import { Vector2 } from './math';
import { Direction } from '../types/actor';

export function getDirectionAngle(direction: Direction) {
	if (direction === Direction.RIGHT) return 0;
	if (direction === Direction.BACK) return (3 * Math.PI) / 2;
	if (direction === Direction.LEFT) return Math.PI;
	if (direction === Direction.FORWARD) return Math.PI / 2;
}

/**
 * determinate if the angle match the direction
 * @param angle rad unit
 */
export function isAngleMatchDirection(direction: Direction, angle: number) {
	if (direction === Direction.RIGHT && (angle > (3 * Math.PI) / 2 || angle <= Math.PI / 2)) {
		return true;
	} else if (direction === Direction.BACK && (angle > Math.PI || angle <= 2 * Math.PI)) {
		return true;
	} else if (direction === Direction.LEFT && angle > Math.PI / 2 && angle <= (3 * Math.PI) / 2) {
		return true;
	} else if (direction === Direction.FORWARD && angle > 0 && angle <= Math.PI) {
		return true;
	}

	return false;
}

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
