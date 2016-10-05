import { isObservable, Reaction, extras } from 'mobx';
import EventEmitter from './utils/EventEmitter';
import { Component } from 'preact';

/**
 * Dev tools support
 */
let isDevtoolsEnabled = false;

export const componentByNodeRegistery: WeakMap<any, any> = new WeakMap();
export const renderReporter = new EventEmitter();

interface IReactiveRender {
	$mobx?: Reaction;
	(param?: () => any): void;
}

export default {
	componentWillMount() {
		// Generate friendly name for debugging
		const initialName = this.displayName || this.name || (this.constructor && (this.constructor.displayName || this.constructor.name)) || "<component>";
		const rootNodeID = this._reactInternalInstance && this._reactInternalInstance._rootNodeID;
		const baseRender = this.render.bind(this);
		let reaction: Reaction;
		let isRenderingPending = false;

		const initialRender = (nextProps, nextContext) => {
			// Inject props & state
			const enhancedRender = () => baseRender(nextProps, nextContext);
			const reactiveRender: IReactiveRender = () => {
				isRenderingPending = false;
				let rendering = undefined;
				reaction.track(() => {
					if (isDevtoolsEnabled) {
						this.__$mobRenderStart = Date.now();
					}
					rendering = extras.allowStateChanges(false, enhancedRender);
					if (isDevtoolsEnabled) {
						this.__$mobRenderEnd = Date.now();
					}
				});
				return rendering;
			};

			reaction = new Reaction(`${initialName}#${rootNodeID}.render()`, () => {
				if (!isRenderingPending) {
					// N.B. Getting here *before mounting* means that a component constructor has side effects
					isRenderingPending = true;
					if (typeof this.componentWillReact === 'function') {
						this.componentWillReact(); // TODO: wrap in action?
					}
					if (this.__$mobxIsUnmounted !== true) {
                        Component.prototype.forceUpdate.call(this);
					}
				}
			});
			reactiveRender.$mobx = reaction;
			this.render = reactiveRender;
			return reactiveRender();
		};

		this.render = initialRender;
	},

	componentWillUnmount() {
		this.render.$mobx && this.render.$mobx.dispose();
		this.__$mobxIsUnmounted = true;
	},

	shouldComponentUpdate(nextProps, nextState) {
		// TODO: if context changed, return true..
		// If props or state did change, but a render was scheduled already, no additional render needs to be scheduled
		if (this.render.$mobx && this.render.$mobx.isScheduled() === true) {
			return false;
		}

		// Update on any state changes (as is the default)
		if (this.state !== nextState) {
			return true;
		}

		// Update if props are shallowly not equal, inspired by PureRenderMixin
		const keys = Object.keys(this.props);
		if (keys.length !== Object.keys(nextProps).length) {
			return true;
		}

		for (let i = keys.length - 1; i >= 0; i--) {
			let key = keys[i];
			const newValue = nextProps[key];
			if (newValue !== this.props[key]) {
				return true;
			} else if (newValue && typeof newValue === 'object' && !isObservable(newValue)) {
				// If the newValue is still the same object, but that object is not observable,
				// fallback to the default behavior: update, because the object *might* have changed.
				return true;
			}
		}
		return false;
	}
};
