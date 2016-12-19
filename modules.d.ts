declare module 'preact-classless-component' {
	function createClass(component: any): any;
	export = createClass;
}

declare module 'preact' {
	export function h(component: any, newProps?: any, children?: any);
	export function render(component: any, container: any, replace?: boolean);
	export class Component<P, C> {
		refs?: any;
		state?: any;
		props?: P;
		context?: C;
		_unmounted?: boolean;
		constructor(props?: P, context?: C);
		componentWillReact();
		componentWillReceiveProps?(nextProps?: P, nextContext?: C): void;
		forceUpdate(force?: boolean): void;
		setState(v: Object, cb?: () => {}): boolean;
		isPrototypeOf(v: Object): void;
	}
}

declare module 'mobx' {
	export function toJS(value: any): any;
	export function observable(value: any): any;
	export function isObservable(value: any, property?: string): boolean;
	export function extendObservable(...rest): any;
	export class Reaction {
		constructor(name?: string, onInvalidate?: any);
		track(param: any): void;
		runReaction();
		dispose();
		getDisposer(): any;
	}
	export const extras: any;
}

declare module 'invariant' {
	function invariant(condition: any, message: string): void;
	export = invariant;
}

declare module 'hoist-non-react-statics' {
	function hoistStatics(connectClass: any, wrappedComponent: any): { [index: string]: any };
	export = hoistStatics;
}
