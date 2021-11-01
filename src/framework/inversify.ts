import { Container } from 'inversify';

export function bindToContainer(container: Container, classes: any[]) {
	for (const cls of classes) {
		container.bind(cls).to(cls).inSingletonScope();
	}
}

export function resolveAllBindings(container: Container, classes: any[]) {
	for (const cls of classes) {
		container.get(cls);
	}
}
