/* eslint no-console: 0 */

import { h, Component, render  } from 'preact';
import { createClass } from 'preact-compat';
import { observable } from 'mobx';
import { connect, Provider } from '../src';
import { createTestRoot } from './test-util';

let testRoot;

beforeEach(() => {
    testRoot = createTestRoot();
});

describe('inject based context', () => {
    test('inject and observe with connect as an HOC', () => {
        const store = {
            @observable foo: 'bar',
        };
        const C = connect([ 'store' ],
            createClass({
                render({ store }) {
                    return <div>context:{store.foo}</div>;
                },
            })
        );
        const B = () => <C/>;
        const A = () => (
            <Provider store={store}>
                <B/>
            </Provider>
        );
        render(<A/>, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar');
        store.foo = 'waddup?';
        expect(testRoot.querySelector('div').textContent).toBe('context:waddup?');
    });

    test('inject and observe with connect as a decorator', () => {
        const store = {
            @observable foo: 'bar',
        };
        @connect([ 'store' ])
        class C extends Component {
            render({store}) {
                return <div>context:{store.foo}</div>;
            }
        }
        const B = () => <C/>;
        const A = () => (
            <Provider store={store}>
                <B/>
            </Provider>
        );
        render(<A/>, testRoot);
        expect(testRoot.querySelector('div').textContent).toBe('context:bar');
        store.foo = 'waddup?';
        expect(testRoot.querySelector('div').textContent).toBe('context:waddup?');
    });
});