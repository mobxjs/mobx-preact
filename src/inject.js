import { h, Component } from 'preact';
import hoistStatics from 'hoist-non-react-statics';
import { observer } from './observer';
import { makeDisplayName } from './utils/utils';

const proxiedInjectorProps = {
    isMobxInjector: {
        value: true,
        writable: true,
        configurable: true,
        enumerable: true,
    },
};

/**
 * Store Injection
 */
function createStoreInjector(grabStoresFn, component, injectNames) {
    const prefix = 'inject-';
    const suffix = injectNames ? '-with-' + injectNames : '';
    const displayName = makeDisplayName(component, { prefix, suffix });

    class Injector extends Component {
        static displayName = displayName

        render() {
            // Optimization: it might be more efficient to apply the mapper function *outside* the render method
            // (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
            // See this test: 'using a custom injector is not too reactive' in inject.js
            const newProps = {};
            for (let key in this.props) {
                if (this.props.hasOwnProperty(key)) {
                    newProps[key] = this.props[key];
                }
            }
            const additionalProps = grabStoresFn(this.context.mobxStores || {}, newProps, this.context) || {};
            for (let key in additionalProps) {
                newProps[key] = additionalProps[key];
            }

            return h(component, newProps);
        }
    }

    // Static fields from component should be visible on the generated Injector
    hoistStatics(Injector, component);

    Injector.wrappedComponent = component;
    Object.defineProperties(Injector, proxiedInjectorProps);

    return Injector;
}

function grabStoresByName(storeNames) {
    return function(baseStores, nextProps) {
        storeNames.forEach(function(storeName) {
            // prefer props over stores
            if (storeName in nextProps) {
                return;
            }
            if (!(storeName in baseStores)) {
                throw new Error(
                    `MobX injector: Store '${storeName}' is not available! Make sure it is provided by some Provider`
                );
            }
            nextProps[storeName] = baseStores[storeName];
        });
        return nextProps;
    };
}

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
export function inject(/* fn(stores, nextProps) or ...storeNames */) {
    let grabStoresFn;
    if (typeof arguments[0] === 'function') {
        grabStoresFn = arguments[0];
        return function(componentClass) {
            let injected = createStoreInjector(grabStoresFn, componentClass);
            injected.isMobxInjector = false; // suppress warning
            // mark the Injector as observer, to make it react to expressions in `grabStoresFn`,
            // see #111
            injected = observer(injected);
            injected.isMobxInjector = true; // restore warning
            return injected;
        };
    } else {
        const storeNames = [];
        for (let i = 0; i < arguments.length; i++) {
            storeNames[i] = arguments[i];
        }
        grabStoresFn = grabStoresByName(storeNames);
        return function(componentClass) {
            return createStoreInjector(grabStoresFn, componentClass, storeNames.join('-'));
        };
    }
}