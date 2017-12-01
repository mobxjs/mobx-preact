import { extras } from 'mobx';
import { Component } from 'preact';

if (!Component) {
    throw new Error('mobx-react requires Preact to be available');
}
if (!extras) {
    throw new Error('mobx-preact requires mobx to be available');
}

export {
    observer as connect,
    observer,
    Observer,
    useStaticRendering,
} from './observer';

export { inject } from './inject';
export { Provider } from './Provider';