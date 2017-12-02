import { h, render }  from 'preact';
import { createClass } from 'preact-compat';
import { observer } from '../src';
import { createTestRoot } from './test-util';

let testRoot;

beforeEach(() => {
    testRoot = createTestRoot();
});

test('stateless component with context support', () => {
    const StatelessCompWithContext = (props, context) =>
        h('div', {}, 'context: ' + context.content);
    const StateLessCompWithContextObserver = observer(StatelessCompWithContext);
    const ContextProvider = createClass({
        getChildContext: () => ({ content: 'hello world' }),
        render: () => <StateLessCompWithContextObserver />,
    });
    render(<ContextProvider />, testRoot);
    expect(testRoot.textContent.replace(/\n/, '')).toBe('context: hello world');
});