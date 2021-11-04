import { ClientSideController } from './client-controller';
import { ClientSideManager } from './client-manager';
import { Entity } from './memory-database';
import { ServerSideController } from './server-controller';
import { ServerSideManager } from './server-manager';

export interface ClassOf<T> {
	new (...args: any[]): T;
}

export interface Provider {
	key: any;
	value: any;
}

export type ClientControllerClass = ClassOf<ClientSideController>;
export type ServerControllerClass = ClassOf<ServerSideController>;

export type ClientManagerClass = ClassOf<ClientSideManager>;
export type ServerManagerClass = ClassOf<ServerSideManager>;

export type EntityClass = ClassOf<Entity>;

export interface ClientSideModule {
	imports: ClientSideModule[];
	controllers: ClientControllerClass[];
	managers: ClientManagerClass[];
	providers: Provider[];
	uiStates: ClassOf<any>[];
}

export interface ServerSideModule {
	imports: ServerSideModule[];
	entities: EntityClass[];
	controllers: ServerControllerClass[];
	managers: ServerManagerClass[];
	providers: Provider[];
}

export interface ServerModuleResolvedResult {
	entities: EntityClass[];
	controllers: ServerControllerClass[];
	managers: ServerManagerClass[];
	providers: Provider[];
}

export function resolveServerSideModule(module: ServerSideModule): ServerModuleResolvedResult {
	const entities: ClassOf<Entity>[] = [...module.entities];
	const controllers: ClassOf<ServerSideController>[] = [...module.controllers];
	const managers: ClassOf<ServerSideManager>[] = [...module.managers];
	const providers: Provider[] = [...module.providers];

	for (const subModule of module.imports) {
		const resolved = resolveServerSideModule(subModule);
		entities.push(...resolved.entities);
		controllers.push(...resolved.controllers);
		managers.push(...resolved.managers);
		providers.push(...resolved.providers);
	}

	return { entities, controllers, managers, providers };
}

export function createServerSideModule(option: Partial<ServerSideModule>): ServerSideModule {
	return {
		imports: option.imports || [],
		entities: option.entities || [],
		controllers: option.controllers || [],
		managers: option.managers || [],
		providers: option.providers || [],
	};
}

export function createClientSideModule(option: Partial<ClientSideModule>): ClientSideModule {
	return {
		imports: option.imports || [],
		controllers: option.controllers || [],
		managers: option.managers || [],
		providers: option.providers || [],
		uiStates: option.uiStates || [],
	};
}
