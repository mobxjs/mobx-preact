/* eslint no-console: 0 */

import { h, Component, render  } from 'preact';
import { createClass } from 'preact-compat';
import { action, observable } from 'mobx';
import { observer, inject, Provider } from '../src';
import { createTestRoot, pause, disabledTest } from './test-util';

test.disable = disabledTest;
let testRoot;

beforeEach(() => {
    testRoot = createTestRoot();
});

describe('inject based context', () => {
    test('basic context', () => {
        const C = inject('foo')(
            observer(
                createClass({
                    render() {
                        return <div>context:{this.props.foo}</div>;
                    },
                })
            )
        );
        const B = () => <C />;
        const A = () => (
            <Provider foo="bar">
                <B />
            </Provider>
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar');
    });

    test('props as args', () => {
        const C = inject('foo')(
            observer(
                createClass({
                    render({ foo }) {
                        return <div>context:{foo}</div>;
                    },
                })
            )
        );
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
        const C = inject('foo')(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        );
        const B = () => <C foo={42} />;
        const A = createClass({
            render: () => (
                <Provider foo="bar">
                    <B />
                </Provider>
            ),
        });
        render(<A />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:42');
    });

    test('overriding stores is supported', () => {
        const C = inject('foo', 'bar')(
            observer(
                createClass({
                    render() {
                        return (
                            <div>
                                context:{this.props.foo}
                                {this.props.bar}
                            </div>
                        );
                    },
                })
            )
        );
        const B = () => <C />;
        const A = createClass({
            render: () => (
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
            ),
        });
        render(<A />, testRoot);
        expect(testRoot.querySelector('span').textContent).toBe('context:bar1337');
        expect(testRoot.querySelector('section').textContent).toBe('context:421337');
    });

    test('store should be available', () => {
        const C = inject('foo')(
            observer(
                createClass({
                    render() {
                        return <div>context:{this.props.foo}</div>;
                    },
                })
            )
        );
        const B = () => <C />;
        const A = createClass({
            render: () => (
                <Provider baz={42}>
                    <B />
                </Provider>
            ),
        });
        expect(() => render(<A />, testRoot)).toThrow(
            /Store 'foo' is not available! Make sure it is provided by some Provider/
        );
    });

    test('store is not required if prop is available', () => {
        const C = inject('foo')(
            observer(
                createClass({
                    render() {
                        return <div>context:{this.props.foo}</div>;
                    },
                })
            )
        );
        const B = () => <C foo="bar" />;
        render(<B />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar');
    });

    test('inject merges (and overrides) props', done => {
        const C = inject(() => ({ a: 1 }))(
            observer(
                createClass({
                    render() {
                        expect(this.props).toEqual({ a: 1, b: 2 });
                        done();
                        return null;
                    },
                })
            )
        );
        const B = () => <C a={2} b={2} />;
        render(<B />, testRoot);
    });

    // TODO: not sure if this applicable any more, with passing stores via observer being removed
    test.disable('warning is printed when changing stores', () => {
        let msg;
        const baseWarn = console.warn;
        console.warn = m => (msg = m);
        const a = observable(3);
        const C = observer(
            ['foo'],
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        );
        const B = observer(
            createClass({
                render: () => <C />,
            })
        );
        const A = observer(
            createClass({
                render: () => (
                    <section>
                        <span>{a.get()}</span>
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
    }, 'not sure if this applicable any more, with passing stores via observer being removed');

    test('custom storesToProps', () => {
        const C = inject((stores, props, context) => {
            expect(context).toEqual({ mobxStores: { foo: 'bar' } });
            expect(stores).toEqual({ foo: 'bar' });
            expect(props).toEqual({ baz: 42, children: [] });
            return {
                zoom: stores.foo,
                baz: props.baz * 2,
            };
        })(
            observer(
                createClass({
                    render() {
                        return (
                            <div>
                                context:{this.props.zoom}
                                {this.props.baz}
                            </div>
                        );
                    },
                })
            )
        );
        const B = createClass({
            render: () => <C baz={42} />,
        });
        const A = () => (
            <Provider foo="bar">
                <B />
            </Provider>
        );
        render(<A />, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar84');
    });

    // I remove the wrappedInstance stuff - couldn't get it work and wasn't sure what it was for:
    // (https://github.com/mobxjs/mobx-react/blob/4.3.5/src/inject.js#L48)
    test('support static hoisting, wrappedComponent and wrappedInstance', () => {
        class B extends Component {
            render() {
                this.testField = 1;
                return null;
            }
        }
        B.bla = 17;
        B.bla2 = {};
        const C = inject('booh')(B);

        expect(C.wrappedComponent).toBe(B);
        expect(B.bla).toBe(17);
        expect(C.bla).toBe(17);
        expect(C.bla2 === B.bla2).toBe(true);

        render(<C booh={42} />, testRoot);
    });

    test('using a custom injector is reactive', () => {
        const user = observable({ name: 'Noa' });
        const mapper = stores => ({ name: stores.user.name });
        const DisplayName = props => <h1>{props.name}</h1>;
        const User = inject(mapper)(DisplayName);
        const App = () => (
            <Provider user={user}>
                <User />
            </Provider>
        );
        render(<App />, testRoot);

        expect(testRoot.querySelector('h1').textContent).toBe('Noa');

        user.name = 'Veria';
        expect(testRoot.querySelector('h1').textContent).toBe('Veria');
    });

    test('using a custom injector is not too reactive', async () => {
        let listRender = 0;
        let itemRender = 0;
        let injectRender = 0;

        function connect() {
            return component => inject.apply(this, arguments)(observer(component));
        }

        class State {
            @observable highlighted = null
            isHighlighted(item) {
                return this.highlighted == item;
            }

            @action
            highlight = item => {
                this.highlighted = item;
            }
        }

        const items = observable([
            { title: 'ItemA' },
            { title: 'ItemB' },
            { title: 'ItemC' },
            { title: 'ItemD' },
            { title: 'ItemE' },
            { title: 'ItemF' },
        ]);

        const state = new State();

        class ListComponent extends Component {
            render() {
                listRender++;
                const { items } = this.props;

                return <ul>{items.map(item => <ItemComponent key={item.title} item={item} />)}</ul>;
            }
        }

        @connect(({ state }, { item }) => {
            injectRender++;
            if (injectRender > 6) {
                // debugger;
            }
            return {
                // Using
                // highlighted: expr(() => state.isHighlighted(item)) // seems to fix the problem
                highlighted: state.isHighlighted(item),
                highlight: state.highlight,
            };
        })
        class ItemComponent extends Component {
            highlight = () => {
                const { item, highlight } = this.props;
                highlight(item);
            }

            render() {
                itemRender++;
                const { highlighted, item } = this.props;
                return (
                    <li className={'hl_' + item.title} onClick={this.highlight}>
                        {item.title} {highlighted ? '(highlighted)' : ''}{' '}
                    </li>
                );
            }
        }

        render(
            <Provider state={state}>
                <ListComponent items={items} />
            </Provider>,
            testRoot);

        expect(listRender).toBe(1);
        expect(injectRender).toBe(6);
        expect(itemRender).toBe(6);

        testRoot.querySelectorAll('.hl_ItemB').forEach(e => e.click());
        await pause(0);
        expect(listRender).toBe(1);
        expect(injectRender).toBe(12); // ideally, 7
        //expect(itemRender).toBe(7); // TOOD: this is 12 after fixing pass props to render()

        testRoot.querySelectorAll('.hl_ItemF').forEach(e => e.click());
        await pause(0);
        expect(listRender).toBe(1);
        expect(injectRender).toBe(18); // ideally, 9
        //expect(itemRender).toBe(9); // TOOD: this is 18 after fixing pass props to render();

        testRoot.parentNode.removeChild(testRoot);
    });
});