import { ActorType, AttachMapping, Direction, RunningState } from '../../shared/actor';
import { Entity } from '../../shared/database/memory';
import { RecordMap, RecordSet } from '../utils';

export const MOVEMENT_TICK_MIN_DISTANCE = 0.0001;
export const CTOR_OPTION_PROPERTY_SYMBOL = Symbol('ctor-option');

/**
 * 标注实体的一个属性是构造器选项
 * 在向客户端要求构造该实体的时候
 * 会传入被所有被该装饰器标注的属性
 */
export function CtorOption() {
	return Reflect.metadata(CTOR_OPTION_PROPERTY_SYMBOL, true);
}

/**
 * 获取所有被标注构造器选项的实体属性
 */
export function GetCtorOptions(target: any) {
	const options: any = {};
	for (const propertyName of Object.getOwnPropertyNames(target)) {
		const metadataValue = Reflect.getMetadata(CTOR_OPTION_PROPERTY_SYMBOL, target, propertyName);
		const targetProperty = target[propertyName];
		if (metadataValue === true) {
			if (targetProperty instanceof RecordMap || targetProperty instanceof RecordSet) {
				options[propertyName] = targetProperty.getAll();
			} else {
				options[propertyName] = targetProperty;
			}
		}
	}
	return options;
}

export interface Attachment {
	key: string;
	relPos?: [number, number];
	actorId: number;
}

export class Actor extends Entity {
	@CtorOption()
	posX = 0;

	@CtorOption()
	posY = 0;

	@CtorOption()
	atLandX = 0;

	@CtorOption()
	atLandY = 0;

	@CtorOption()
	motionX = 0;

	@CtorOption()
	motionY = 0;

	@CtorOption()
	isUsing = false;

	@CtorOption()
	useTick = 0;

	@CtorOption()
	attachments: RecordMap<Attachment> = new RecordMap();

	@CtorOption()
	attaching: Attachment;

	type: ActorType;

	@CtorOption()
	attachMapping: AttachMapping;

	isMoveDirty = false;
	isWalkDirty = false;
	isLandMoveDirty = false;

	isActor = true;

	direction: Direction = Direction.FORWARD;
	running: RunningState = RunningState.SILENT;
}
