/* eslint no-console: 0 */

import { h, render} from 'preact';
import { createClass } from 'preact-compat';
import { observable} from 'mobx';
import { observer, inject, Provider } from '../src';

import { createTestRoot } from './test-util';

let testRoot;

beforeEach(() => {
    testRoot = createTestRoot();
});

describe('observer based context', () => {
    test('basic context', () => {
        const C = inject('foo')(observer(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        ));
        const B = () => <C />;
        const A = () => (
            <Provider foo="bar">
                <B />
            </Provider>
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar');
    });

    test('props override context', () => {
        const C = inject('foo')(observer(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        ));
        const B = () => <C foo={42} />;
        const A = () => (
            <Provider foo="bar">
                <B />
            </Provider>
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:42');
    });

    test('overriding stores is supported', () => {
        const C = observer(
            inject('foo','bar')(
                createClass({
                    render() {
                        return (
                            <div>
                            context:{this.props.foo}
                                {this.props.bar}
                            </div>
                        );
                    },
                }))
        );
        const B = () => <C />;
        const A = () => (
            <Provider foo="bar" bar={1337}>
                <div>
                    <span>
                        <B />
                    </span>
                    <section>
                        <Provider foo={42}>
                            <B />
                        </Provider>
                    </section>
                </div>
            </Provider>
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('span').textContent).toBe('context:bar1337');
        expect(testRoot.querySelector('section').textContent).toBe('context:421337');
    });

    test('store is not required if prop is available', () => {
        const C = inject('foo')(observer(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        ));
        const B = () => <C foo="bar" />;
        render(<B />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar');
    });

    test('warning is printed when changing stores', () => {
        let msg = null;
        const baseWarn = console.warn;
        console.warn = m => (msg = m);
        const a = observable(3);
        const C = inject('foo')(observer(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        ));
        const B = observer(
            createClass({
                render: () => <C />,
            })
        );
        const A = observer(
            createClass({
                render: () => (
                    <section>
                        <span>{a.get()}</span>,
                        <Provider foo={a.get()}>
                            <B />
                        </Provider>
                    </section>
                ),
            })
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('span').textContent).toBe('3');
        expect(testRoot.querySelector('div').textContent).toBe('context:3');
        a.set(42);
        expect(testRoot.querySelector('span').textContent).toBe('42');
        expect(testRoot.querySelector('div').textContent).toBe('context:3');
        expect(msg).toBe(
            'MobX Provider: Provided store \'foo\' has changed. Please avoid replacing stores as the change might not propagate to all children'
        );
        console.warn = baseWarn;
    });

    test('warning is not printed when changing stores, but suppressed explicitly', () => {
        let msg = null;
        const baseWarn = console.warn;
        console.warn = m => (msg = m);
        const a = observable(3);
        const C = inject('foo')(observer(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        ));
        const B = observer(
            createClass({
                render: () => <C />,
            })
        );
        const A = observer(
            createClass({
                render: () => (
                    <section>
                        <span>{a.get()}</span>,
                        <Provider foo={a.get()} suppressChangedStoreWarning>
                            <B />
                        </Provider>
                    </section>
                ),
            })
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('span').textContent).toBe('3');
        expect(testRoot.querySelector('div').textContent).toBe('context:3');
        a.set(42);
        expect(testRoot.querySelector('span').textContent).toBe('42');
        expect(testRoot.querySelector('div').textContent).toBe('context:3');
        expect(msg).toBe(null);
        console.warn = baseWarn;
    });

    test('Provider supports multiple children', () => {
        const store = {
            B: 'foo',
            C: 'bar',
        };

        const B = inject('store')(({ store }) => <div class="b">{ store.B }</div>);
        const C = inject('store')(({ store }) => <div class="c">{ store.C }</div>);
        const A = () => (
            <Provider store={store}>
                <B/>
                <C/>
            </Provider>
        );
        render(<A/>, testRoot);
        expect(testRoot.querySelector('.b').textContent).toBe('foo');
        expect(testRoot.querySelector('.c').textContent).toBe('bar');
    });
});
