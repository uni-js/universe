export interface Attribute {
	key: string;
	val: any;
	dirty: boolean;
}

export class AttributeMap {
	private attributes = new Map<string, Attribute>();
	private isDirty = false;

	set(key: string, val: any) {
		let attr: Attribute = this.attributes.get(key);
		if (attr) {
			if (attr.val !== val) {
				attr.dirty = true;
				attr.val = val;
				this.isDirty = true;
			}
		} else {
			this.attributes.set(key, { dirty: true, val, key });
		}
		return attr;
	}

	getAll() {
		const obj: Record<string, any> = {};
		for (const attr of this.attributes.values()) {
			obj[attr.key] = attr.val;
		}
		return obj;
	}

	getDirtyAll() {
		const obj: Record<string, any> = {};
		for (const attr of this.attributes.values()) {
			if (attr.dirty) {
				obj[attr.key] = attr.val;
			}
		}
		return obj;
	}

	hasDirty() {
		return this.isDirty;
	}

	cleanAllDirty() {
		for (const attr of this.attributes.values()) {
			attr.dirty = false;
		}
		this.isDirty = false;
	}
}
