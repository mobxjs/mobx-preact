import { Component } from 'preact';
import { warning } from './utils/shared';

const specialKeys = {
	children: true,
	key: true,
	ref: true
};

function childOnly(children) {
	if (children.length > 1) {
		throw new Error('Provider can only have one direct child');
	}
	return children.length ? children[0] : children;
}

export default class Provider extends Component<any, any> {
	contextTypes: any = {
		mobxStores() {
		}
	};
	childContextTypes: any = {
		mobxStores() {
		}
	};
	private store: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this.store = props.store;
	}

	public render() {
		return childOnly(this.props.children);
	}

	getChildContext() {
		let stores = {};
		// inherit stores
		let baseStores = this.context.mobxStores;

		if (baseStores) {
			for (let key in baseStores) {
				stores[key] = baseStores[key];
			}
		}
		// add own stores
		for (let key in this.props) {
			if (!specialKeys[key]) {
				stores[key] = this.props[key];
			}
		}
		return {
			mobxStores: stores
		};
	}
}

if (process.env.NODE_ENV !== 'production') {
	Provider.prototype.componentWillReceiveProps = function(nextProps) {

		// Maybe this warning is to aggressive?
		warning(Object.keys(nextProps).length === Object.keys(this.props).length,
			'MobX Provider: The set of provided stores has changed. ' +
			'Please avoid changing stores as the change might not propagate to all children'
		);
		for (let key in nextProps) {
			warning(specialKeys[key] || this.props[key] === nextProps[key],
				`MobX Provider: Provided store '${key}' has changed. ` +
				`Please avoid replacing stores as the change might not propagate to all children`
			);
		}

	};
}

