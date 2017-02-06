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

class Provider extends Component {
	constructor(props, context) {
		super(props, context);
		this.store = props.store;
	}

	getChildContext() {
		const stores = {};
		// inherit stores
		const baseStores = this.context.mobxStores;

		if (baseStores) {
			for (const key in baseStores) {
				stores[key] = baseStores[key];
			}
		}
		// add own stores
		for (const key in this.props) {
			if (!specialKeys[key]) {
				stores[key] = this.props[key];
			}
		}
		return {
			mobxStores: stores
		};
	}

	render() {
		return childOnly(this.props.children);
	}
}

if (process.env.NODE_ENV !== 'production') {
	Provider.prototype.componentWillReceiveProps = function(nextProps) {

		// Maybe this warning is to aggressive?
		warning(Object.keys(nextProps).length === Object.keys(this.props).length,
			'MobX Provider: The set of provided stores has changed. ' +
			'Please avoid changing stores as the change might not propagate to all children'
		);
		for (const key in nextProps) {
			warning(specialKeys[key] || this.props[key] === nextProps[key],
				`MobX Provider: Provided store '${key}' has changed. ` +
				`Please avoid replacing stores as the change might not propagate to all children`
			);
		}

	};
}

Provider.contextTypes = {
	mobxStores() {}
};

Provider.childContextTypes = {
	mobxStores() {}
};

export default Provider
