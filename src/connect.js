import { observer } from './observer';
import { inject } from './inject';

export function connect(arg1, arg2) {
    if (typeof arg1 === 'string') {
        throw new Error('Store names should be provided as array');
    }
    if (Array.isArray(arg1)) {
        if (!arg2) {
            // invoked as decorator
            return componentClass => connect(arg1, componentClass);
        } else {
            return inject.apply(null, arg1)(connect(arg2));
        }
    }
    return observer(arg1);
}
