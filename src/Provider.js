import { Component } from 'preact';
import { childrenOnly } from './utils/utils';

const specialReactKeys = { children: true, key: true, ref: true };

const logger = console; // eslint-disable-line no-console

export class Provider extends Component {
    render({ children }) {
        return childrenOnly(children);
    }

    getChildContext() {
        const stores = {};
        // inherit stores
        const baseStores = this.context.mobxStores;
        if (baseStores) {
            for (let key in baseStores) {
                stores[key] = baseStores[key];
            }
        }
        // add own stores
        for (let key in this.props) {
            if (!specialReactKeys[key] && key !== 'suppressChangedStoreWarning') {
                stores[key] = this.props[key];
            }
        }

        return {
            mobxStores: stores,
        };
    }

    componentWillReceiveProps(nextProps) {
        // Maybe this warning is too aggressive?
        if (Object.keys(nextProps).length !== Object.keys(this.props).length) {
            logger.warn(
                'MobX Provider: The set of provided stores has changed. Please avoid changing stores as the change might not propagate to all children'
            );
        }
        if (!nextProps.suppressChangedStoreWarning) {
            for (let key in nextProps) {
                if (!specialReactKeys[key] && this.props[key] !== nextProps[key]) {
                    logger.warn(
                        `MobX Provider: Provided store '${key}' has changed. Please avoid replacing stores as the change might not propagate to all children`
                    );
                }
            }
        }
    }
}