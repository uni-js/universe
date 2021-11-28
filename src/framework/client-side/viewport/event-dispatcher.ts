import { EventEmitter2 } from 'eventemitter2';
import { inject } from 'inversify';
import { Viewport } from './viewport';

export interface ConvertedMouseEvent {
	screenX: number;
	screenY: number;
	floorX: number;
	floorY: number;
	worldX: number;
	worldY: number;
}

export class ViewportHTMLEventDispatcher extends EventEmitter2 {
	private element: HTMLElement;

	constructor(private viewport: Viewport) {
		super();
	}

	bind(element: HTMLElement) {
		if (this.element) {
			throw new Error(`already bound`);
		}
		this.element = element;
		this.element.addEventListener('mousedown', (ev) => {
			this.emit('mousedown', this.convertMouseEvent(ev));
		});
		this.element.addEventListener('mouseup', (ev) => {
			this.emit('mouseup', this.convertMouseEvent(ev));
		});
		this.element.addEventListener('mousemove', (ev) => {
			this.emit('mousemove', this.convertMouseEvent(ev));
		});
	}

	private convertMouseEvent(ev: MouseEvent) {
		const [worldX, worldY] = this.viewport.getWorldPointAt(ev.offsetX, ev.offsetY);
		const newEvent: ConvertedMouseEvent = {
			worldX,
			worldY,
			floorX: Math.floor(worldX),
			floorY: Math.floor(worldY),
			screenX: ev.offsetX,
			screenY: ev.offsetY,
		};
		return newEvent;
	}
}
