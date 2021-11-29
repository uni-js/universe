export function UIState() {
	return (target: any) => target;
}

export interface UIStateMetaInfo {
	/**
	 * state revision, increased when state changed
	 */
	revision: number;

	class: any;
}

export type UIStateWithMetaInfo<T> = T & { meta: UIStateMetaInfo };

export function ObserveArrayChange(array: any[], onchange: () => void) {
	return new Proxy(array, {
		set() {
			onchange();
			return true;
		},
	});
}

/**
 * create a ui state
 *
 * @param definedClass the class that defines the ui state
 */
export function CreateUIState(definedClass: any) {
	const stateObject = new definedClass();
	const metaInfo: UIStateMetaInfo = {
		revision: 0,
		class: definedClass,
	};
	return new Proxy(stateObject, {
		get(obj, prop) {
			if (prop == 'meta') {
				return metaInfo;
			}

			if (Array.isArray(obj[prop])) {
				return ObserveArrayChange(obj[prop], () => {
					metaInfo.revision++;
				});
			}

			return obj[prop];
		},
		set(obj, prop, value) {
			obj[prop] = value;
			metaInfo.revision++;
			return true;
		},
	});
}

export class UIStateContainer {
	private uiStates = new Map<string, any>();
	constructor(private uiStateDefs: any[]) {
		for (const def of this.uiStateDefs) {
			this.uiStates.set(def, CreateUIState(def));
		}
	}

	getEntries() {
		return Array.from(this.uiStates.entries());
	}

	getState(clazz: any) {
		return this.uiStates.get(clazz);
	}
}
