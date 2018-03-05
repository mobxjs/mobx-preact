import { Component } from 'preact';

if (!Component) {
    throw new Error('mobx-preact requires Preact to be available');
}

export {
    observer,
    Observer,
    useStaticRendering,
} from './observer';

export { connect } from './connect';
export { inject } from './inject';
export { Provider } from './Provider';