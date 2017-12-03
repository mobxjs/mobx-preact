import { Component } from 'preact';

export function isStateless(component) {
    // `function() {}` has prototype, but `() => {}` doesn't
    // `() => {}` via Babel has prototype too.
    return !(component.prototype && component.prototype.render) && !Component.isPrototypeOf(component);
}

export function makeDisplayName(component, { prefix = '', suffix = ''} = {}) {
    let displayName =
        (component.displayName || component.name || (component.constructor && component.constructor.name) || '<component>');
    return prefix + displayName + suffix;
}