import { AttachType } from '../module/actor-module/spec';
import { RecordMap, RecordSet } from '../utils';

export const MOVEMENT_TICK_MIN_DISTANCE = 0.0001;
export const CTOR_OPTION_PROPERTY_SYMBOL = Symbol('ctor-option');

/**
 * mark a entity property as a constructor option
 * when server request client to construct the entity,
 * it will be provided these properties.
 */
export function ConstructOption() {
	return Reflect.metadata(CTOR_OPTION_PROPERTY_SYMBOL, true);
}

/**
 * get all properties mark as constructor option
 */
export function GetConstructOptions(target: any) {
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
	key: AttachType;
	relPos?: [number, number];
	actorId: number;
}
