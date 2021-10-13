export function GetAllMethodsOfObject(object: any) {
	return Object.getOwnPropertyNames(object).filter(function (property) {
		return typeof object[property] == 'function';
	});
}
