export enum ItemType {
	EMPTY,
	BOW,
	WP_ROCK,
}

export enum ItemTypeName {
	'empty',
	'bow',
	'wp_rock',
}

export enum ItemHoldAction {
	/**
	 * do nothing
	 */
	NONE,
	/**
	 * attach the actor specified
	 */
	ATTACH_SPEC_ACTOR,
	/**
	 * attach the item actor specified
	 */
	ATTACH_ITEM_ACTOR,
}
