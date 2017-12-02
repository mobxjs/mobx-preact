import { Component } from 'preact';

export function isStateless(component) {
    // `function() {}` has prototype, but `() => {}` doesn't
    // `() => {}` via Babel has prototype too.
    return !(component.prototype && component.prototype.render) && !Component.isPrototypeOf(component);
}

// adapted from https://github.com/developit/preact-compat/blob/3.17.0/src/index.js#L204
export function childrenOnly(children) {
    children = children == null ? [] : [].concat(children);
    if (children.length !== 1) {
        throw new Error('Children.only() expects only one child.');
    }
    return children[0];
}

export function makeDisplayName(component, { prefix = '', suffix = ''} = {}) {
    let displayName =
        (component.displayName || component.name || (component.constructor && component.constructor.name) || '<component>');
    return prefix + displayName + suffix;
}