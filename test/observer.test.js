/* eslint no-console: 0 */

import { h, render, Component } from 'preact';
import { observable, action, computed, transaction, extras, extendObservable } from 'mobx';
import { createClass } from 'preact-compat';
import renderToString  from 'preact-render-to-string';
import { observer, useStaticRendering, Observer, inject } from '../src';
import { pause, disabledTest } from './test-util';

const logger = console; // eslint-disable-line no-console

test.disable = disabledTest;

const store = observable({
    todos: [
        {
            title: 'a',
            completed: false,
        },
    ],
});

let todoItemRenderings = 0;
const TodoItem = observer(function TodoItem(props) {
    todoItemRenderings++;
    return <li>|{props.todo.title}</li>;
});

let todoListRenderings = 0;
let todoListWillReactCount = 0;
const TodoList = observer(
    createClass({
        renderings: 0,
        componentWillReact() {
            todoListWillReactCount++;
        },
        render() {
            todoListRenderings++;
            const todos = store.todos;
            return (
                <div>
                    <span>{todos.length}</span>
                    {todos.map((todo, idx) => <TodoItem key={idx} todo={todo} />)}
                </div>
            );
        },
    })
);

const App = () => <TodoList />;

const getDNode = (obj, prop) => obj.$mobx.values[prop];
const testRoot = document.body;

afterEach(() => {
    document.body.innerHTML = '';
});

test('nestedRendering', () => {
    render(<App />, document.body);

    expect(todoListRenderings).toBe(1); // should have rendered list once
    expect(todoListWillReactCount).toBe(0);

    expect(todoListRenderings).toBe(1); // should have rendered list once
    expect(todoListWillReactCount).toBe(0); // should not have reacted yet
    expect(testRoot.querySelectorAll('li').length).toBe(1);
    expect(testRoot.querySelector('li').textContent).toBe('|a');

    expect(todoItemRenderings).toBe(1); // item1 should render once

    expect(getDNode(store, 'todos').observers.length).toBe(1);
    expect(getDNode(store.todos[0], 'title').observers.length).toBe(1);

    store.todos[0].title += 'a';

    expect(todoListRenderings).toBe(1); // should have rendered list once
    expect(todoListWillReactCount).toBe(0); // should not have reacted
    expect(todoItemRenderings).toBe(2); //item1 should have rendered twice
    expect(getDNode(store, 'todos').observers.length).toBe(1); // observers count shouldn\'t change
    expect(getDNode(store.todos[0], 'title').observers.length).toBe(1); // title observers should not have increased'

    store.todos.push({
        title: 'b',
        completed: true,
    });

    expect(testRoot.querySelectorAll('li').length).toBe(2); // list should two items in in the list'
    expect(Array.from(testRoot.querySelectorAll('li')).map(e => e.textContent)).toEqual([
        '|aa',
        '|b',
    ]);

    expect(todoListRenderings).toBe(2); // should have rendered list twice
    expect(todoListWillReactCount).toBe(1);//should have reacted
    expect(todoItemRenderings).toBe(3); // item2 should have rendered as well
    expect(getDNode(store.todos[1], 'title').observers.length).toBe(1); //title observers should have increased
    expect(getDNode(store.todos[1], 'completed').observers.length).toBe(0); //completed observers should not have increased'

    const oldTodo = store.todos.pop();

    expect(todoListRenderings).toBe(3); // should have rendered list another time
    expect(todoListWillReactCount).toBe(2); // should have reacted
    expect(todoItemRenderings).toBe(3); // item1 should not have rerendered');
    expect(testRoot.querySelectorAll('li').length).toBe(1); // 'list should have only on item in list now

    // TODO: this fails :(
    // expect(getDNode(oldTodo, 'title').observers.length).toBe(0) // title observers should have decreased
    expect(getDNode(oldTodo, 'completed').observers.length).toBe(0); // completed observers should not have decreased
});

test('keep views alive', () => {
    let yCalcCount = 0;
    const data = observable({
        x: 3,
        get y() {
            yCalcCount++;
            return this.x * 2;
        },
        z: 'hi',
    });

    const TestComponent = observer(function testComponent() {
        return (
            <div>
                {data.z}
                {data.y}
            </div>
        );
    });

    render(<TestComponent />, document.body);
    expect(yCalcCount).toBe(1);

    expect(testRoot.textContent).toBe('hi6');

    data.z = 'hello';
    // test: rerender should not need a recomputation of data.y because the subscription is kept alive

    expect(yCalcCount).toBe(1);

    expect(testRoot.textContent).toBe('hello6');
    expect(yCalcCount).toBe(1);

    expect(getDNode(data, 'y').observers.length).toBe(1);

    render(<div />, document.body, document.body.lastElementChild);

    // TODO: This fails
    // expect(getDNode(data, 'y').observers.length).toBe(0);
});

test('componentWillMount from mixin is run first', done => {
    const Comp = observer(
        createClass({
            componentWillMount: function() {
                // ugly check, but proofs that observer.willmount has run
                expect(this.render.name).toBe('initialRender');
                done();
            },
            render() {
                return null;
            },
        })
    );
    render(<Comp />, testRoot);
});

test('does not keep views alive when using static rendering', () => {
    useStaticRendering(true);

    let renderCount = 0;
    const data = observable({
        z: 'hi',
    });

    const TestComponent = observer(function testComponent() {
        renderCount++;
        return <div>{data.z}</div>;
    });

    render(<TestComponent />, testRoot);
    expect(renderCount).toBe(1);
    expect(testRoot.querySelector('div').textContent).toBe('hi');

    data.z = 'hello';
    // no re-rendering on static rendering

    expect(renderCount).toBe(1);

    expect(testRoot.querySelector('div').textContent).toBe('hi');
    expect(renderCount).toBe(1);

    expect(getDNode(data, 'z').observers.length).toBe(0);

    useStaticRendering(false);
});

test('does not keep views alive when using static + string rendering', () => {
    useStaticRendering(true);

    let renderCount = 0;
    const data = observable({
        z: 'hi',
    });

    const TestComponent = observer(function testComponent() {
        renderCount++;
        return <div>{data.z}</div>;
    });

    const output = renderToString(<TestComponent />);

    data.z = 'hello';

    expect(output).toBe('<div>hi</div>');
    expect(renderCount).toBe(1);

    expect(getDNode(data, 'z').observers.length).toBe(0);

    useStaticRendering(false);
});

test('issue 12', () => {
    const data = observable({
        selected: 'coffee',
        items: [
            {
                name: 'coffee',
            },
            {
                name: 'tea',
            },
        ],
    });

    /** Row Class */
    class Row extends Component {
        constructor(props) {
            super(props);
        }

        render() {
            return (
                <span>
                    {this.props.item.name}
                    {data.selected === this.props.item.name ? '!' : ''}
                </span>
            );
        }
    }

    /** table stateles component */
    const Table = observer(function table() {
        return <div>{data.items.map(item => <Row key={item.name} item={item} />)}</div>;
    });

    render(<Table />, testRoot);
    expect(testRoot.querySelector('div').textContent).toBe('coffee!tea');

    transaction(() => {
        data.items[1].name = 'boe';
        data.items.splice(0, 2, { name: 'soup' });
        data.selected = 'tea';
    });

    expect(testRoot.querySelector('div').textContent).toBe('soup');
});

test('changing state in render should fail', done => {
    const data = observable(2);
    const Comp = observer(() => {
        if (data.get() === 3) {
            try {
                data.set(4); // wouldn't throw first time for lack of observers.. (could we tighten this?)
            } catch (err) {
                expect(err.message).toMatch(/Side effects like changing state are not allowed at this point/);
                done();
            }
        }
        return <div>{data.get()}</div>;
    });

    render(<Comp />, testRoot);
    data.set(3); // cause throw
    extras.resetGlobalState();
});

test('component should not be inject', () => {
    const msg = [];
    const baseWarn = logger.warn;
    console.warn = m => msg.push(m);

    observer(
        inject('foo')(
            createClass({
                render() {
                    return <div>context:{this.props.foo}</div>;
                },
            })
        )
    );

    expect(msg.length).toBe(1);
    console.warn = baseWarn;
});

test('observer component can be injected', () => {
    const msg = [];
    const baseWarn = console.warn;
    logger.warn = m => msg.push(m);

    inject('foo')(
        observer(
            createClass({
                render: () => null,
            })
        )
    );

    // N.B, the injected component will be observer since mobx-react 4.0!
    inject(() => {})(
        observer(
            createClass({
                render: () => null,
            })
        )
    );

    expect(msg.length).toBe(0);
    logger.warn = baseWarn;
});

test('124 - react to changes in this.props via computed', async () => {
    const Comp = observer(
        createClass({
            componentWillMount() {
                extendObservable(this, {
                    get computedProp() {
                        return this.props.x;
                    },
                });
            },
            render() {
                return <span>x:{this.computedProp}</span>;
            },
        })
    );

    const Parent = createClass({
        getInitialState() {
            return { v: 1 };
        },
        render() {
            return (
                <div onClick={() => this.setState({ v: 2 })}>
                    <Comp x={this.state.v} />
                </div>
            );
        },
    });

    render(<Parent />, testRoot);
    expect(testRoot.querySelector('span').textContent).toBe('x:1');
    testRoot.querySelector('div').click();
    await pause(0);

    expect(testRoot.querySelector('span').textContent).toBe('x:2');
});

test('should render component even if setState called with exactly the same props', async () => {
    let renderCount = 0;
    const Component = observer(
        createClass({
            onClick() {
                this.setState({});
            },
            render() {
                renderCount++;
                return <div onClick={this.onClick} id="clickableDiv" />;
            },
        })
    );
    render(<Component />, testRoot);
    expect(renderCount).toBe(1); // renderCount === 1
    testRoot.querySelector('#clickableDiv').click();

    await pause();

    expect(renderCount).toBe(2); //renderCount === 2
    testRoot.querySelector('#clickableDiv').click();

    await pause();
    expect(renderCount).toBe(3); // renderCount === 3
});

// TODO: this fails. Not sure why. The clicks don't trigger a render
test('it rerenders correctly if some props are non-observables - 1', async () => {
    let renderCount = 0;
    let odata = observable({ x: 1 });
    let data = { y: 1 };

    @observer
    class MyComponent extends Component {
        @computed
        get computed() {
            // n.b: data.y would not rerender! shallowly new equal props are not stored
            return this.props.odata.x;
        }
        render() {
            renderCount++;
            return (
                <span onClick={stuff}>
                    {this.props.odata.x}-{this.props.data.y}-{this.computed}
                </span>
            );
        }
    }

    const Parent = observer(
        createClass({
            render() {
                // this.props.odata.x;
                return <MyComponent data={this.props.data} odata={this.props.odata} />;
            },
        })
    );

    function stuff() {
        data.y++;
        odata.x++;
    }

    render(<Parent odata={odata} data={data} />, testRoot);
    expect(renderCount).toBe(1); // renderCount === 1
    expect(testRoot.querySelector('span').textContent).toBe('1-1-1');

    testRoot.querySelector('span').click();
    await pause(100);
    expect(renderCount).toBe(2); // renderCount === 2
    expect(testRoot.querySelector('span').textContent).toBe('2-2-2');

    testRoot.querySelector('span').click();
    await pause();
    expect(renderCount).toBe(3); // renderCount === 3
    expect(testRoot.querySelector('span').textContent).toBe('3-3-3');
});

// TODO: this fails. Not sure why. The clicks don't trigger a render
test('it rerenders correctly if some props are non-observables - 2', async () => {
    let renderCount = 0;
    let odata = observable({ x: 1 });

    @observer
    class MyComponent extends Component {
        @computed
        get computed() {
            return this.props.data.y; // should recompute, since props.data is changed
        }

        render() {
            renderCount++;
            return (
                <span onClick={stuff}>
                    {this.props.data.y}-{this.computed}
                </span>
            );
        }
    }

    const Parent = observer(
        createClass({
            render() {
                let data = { y: this.props.odata.x };
                return <MyComponent data={data} odata={this.props.odata} />;
            },
        })
    );

    function stuff() {
        odata.x++;
    }

    render(<Parent odata={odata} />, testRoot);
    expect(renderCount).toBe(1); // renderCount === 1');
    expect(testRoot.querySelector('span').textContent).toBe('1-1');

    testRoot.querySelector('span').click();
    await pause(0);

    expect(renderCount).toBe(2); // renderCount === 2');
    expect(testRoot.querySelector('span').textContent).toBe('2-2');

    testRoot.querySelector('span').click();
    await pause(0);

    expect(renderCount).toBe(3); // renderCount === 3');
    expect(testRoot.querySelector('span').textContent).toBe('3-3');
});

test('Observer regions should react', () => {
    const data = observable('hi');
    const Comp = () => (
        <div>
            <Observer>{() => <span>{data.get()}</span>}</Observer>
            <li>{data.get()}</li>
        </div>
    );
    render(<Comp />, testRoot);

    expect(testRoot.querySelector('span').textContent.trim()).toBe('hi');
    expect(testRoot.querySelector('li').textContent.trim()).toBe('hi');

    data.set('hello');

    expect(testRoot.querySelector('span').textContent.trim()).toBe('hello');
    expect(testRoot.querySelector('li').textContent.trim()).toBe('hi');
});

test('Observer should not re-render on shallow equal new props', () => {
    let childRendering = 0;
    let parentRendering = 0;
    const data = { x: 1 };
    const odata = observable({ y: 1 });

    const Child = observer(({ data }) => {
        childRendering++;
        return <span>{data.x}</span>;
    });
    const Parent = observer(() => {
        parentRendering++;
        odata.y; /// depend
        return <Child data={data} />;
    });

    render(<Parent />, testRoot);
    expect(parentRendering).toBe(1);
    expect(childRendering).toBe(1);
    expect(testRoot.querySelector('span').textContent.trim()).toBe('1');

    odata.y++;

    expect(parentRendering).toBe(2);
    expect(childRendering).toBe(1);
    expect(testRoot.querySelector('span').textContent.trim()).toBe('1');
});

test('parent / childs render in the right order', () => {
    // See: https://jsfiddle.net/gkaemmer/q1kv7hbL/13/
    let events = [];

    class User {
        @observable name = 'User\'s name'
    }

    class Store {
        @observable user = new User()
        @action
        logout() {
            this.user = null;
        }
    }

    function tryLogout() {
        store.logout();
    }

    const store = new Store();

    const Parent = observer(() => {
        events.push('parent');
        if(!store.user) {
            return <span>Logged out</span>;
        }
        return (
            <div>
                <Child />
                <button onClick={tryLogout}>Logout</button>
            </div>
        );
    });

    const Child = observer(() => {
        events.push('child');
        return store.user ? <span>Logged in as: {store.user.name}</span> : null;
    });

    render(<Parent />, testRoot);

    tryLogout();

    // it seems to make sense that child is rendered twice, but this differs from the mobx-react original test so
    // maybe something is wrong. But the render order is correct.
    expect(events).toEqual(['parent', 'child', 'child', 'parent']);
});

/*eslint-disable */
// FIXME: test seems to work correctly, but errors cannot tested atm with DOM rendering
test.disable('206 - @observer should produce usefull errors if it throws', () => {
    const data = observable({ x: 1 });
    let renderCount = 0;

    const emmitedErrors = [];
    const disposeErrorsHandler = onError(error => emmitedErrors.push(error));

    @observer
    class Child extends Component {
        render() {
            renderCount++;
            if (data.x === 42) {
                throw new Error('Oops!');
            }
            return <span>{data.x}</span>;
        }
    }

    render(<Child />, testRoot);
    expect(renderCount).toBe(1);

    try {
        data.x = 42;
        expect(true).toBe(false);
    } catch (e) {
        const lines = e.stack.split('\n');
        expect(lines[0]).toBe('Error: Oops!');
        expect(lines[1].indexOf('at Child.render')).toBe(4);
        expect(renderCount).toBe(2);
    }

    data.x = 3; // component recovers!
    expect(renderCount).toBe(3);

    expect(emmitedErrors).toEqual([new Error('Oops!')]);
    disposeErrorsHandler();
}, 'onError is not yet implemented');
/*eslint-enable */

test('195 - async componentWillMount does not work', async () => {
    const renderedValues = [];

    @observer
    class WillMount extends Component {
        @observable counter = 0

        @action inc = () => this.counter++

        componentWillMount() {
            setTimeout(() => this.inc(), 300);
        }

        render() {
            renderedValues.push(this.counter);
            return (
                <p>
                    {this.counter}
                    <button onClick={this.inc}>+</button>
                </p>
            );
        }
    }

    render(<WillMount />, testRoot);
    await pause(500);

    expect(renderedValues).toEqual([0, 1]);
});