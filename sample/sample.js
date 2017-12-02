import { h, Component, render } from 'preact';
import { observable, action } from 'mobx';
import { observer, Provider, inject } from '../../lib/index';

const store = {
    @observable count: 0,
    @action increment: function () {
        this.count++;
    },
};

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <div>
                    <CounterComp />
                    <CounterStateless />
                    <NotObserver />
                    <IncrementButton />
                </div>
            </Provider>
        );
    }
}

@inject('store')
@observer
class CounterComp extends Component {
    render({ store }) {
        return <p>Comp count is { store.count }</p>;
    }
}

const CounterStateless = inject('store')(observer(function({ store}) {
    return <p>Stateless count is { store.count }</p>;
}));

const NotObserver = inject('store')(function NotObserver({ store }) {
    return <p>I will not change: { store.count } :(</p>;
});

const IncrementButton = inject('store')(function({ store }) {
    return <button onClick={ev => {
        store.increment();
    }}>Increment</button>;
});

render(<App/>, document.body);