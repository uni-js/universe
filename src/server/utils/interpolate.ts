import { CurveInterpolator2D } from 'curve-interpolator';
import { Vector2 } from './vector2';

export function Interpolate2d(points: Vector2[], x: number) {
	const interpolator = new CurveInterpolator2D(points.map((point) => [point.x, point.y]));
	const point = interpolator.getPointAt(x);

	return new Vector2(point[0], point[1]);
}