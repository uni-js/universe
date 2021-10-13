export function GetAllMethodsOfObject(object: any) {
	const prototype = Object.getPrototypeOf(object);
	return Object.getOwnPropertyNames(prototype).filter(function (property) {
		return typeof object[property] == 'function';
	});
}
