import { extras } from 'mobx';
import { Component } from 'preact';

if (!Component) {
    throw new Error('mobx-react requires React to be available');
}
if (!extras) {
    throw new Error('mobx-react requires mobx to be available');
}

export {
    observer,
    Observer,
    useStaticRendering,
} from './observer';

export { inject } from './inject';
export { Provider } from './Provider';