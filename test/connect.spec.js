import 'mocha';
import { expect } from 'chai';
import { h, render, Component } from 'preact';
import Provider from '../src/Provider';
import connect from '../src/connect';
import inject from '../src/inject';

describe('MobX connect()', () => {

	it('should throw if store is invalid', () => {
		const tryConnect = () => connect('invalidStore', () => 'Test');
		expect(tryConnect).to.throw(Error, /should be provided as array/);
	});

	it('should throw if component is invalid', () => {
		const tryConnect = () => connect(null);
		expect(tryConnect).to.throw(Error, /Please pass a valid component/);
	});

	it('should connect without second argument', () => {
		const tryConnect = () => connect(['invalidStore'])(() => 'Test');
		expect(tryConnect).to.not.throw(Error);
	});

});

describe('MobX inject()', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	class TestComponent extends Component {
		render({ testStore }) {
			return h('span', null, testStore);
		}
	}

	/*it('should inject without second argument', () => {

	 class TestComponent extends Component<any, any> {
	 static defaultProps = { hello: 'world' };
	 render() {
	 return 'Test';
	 }
	 };
	 const tryInject = () => inject()(TestComponent);
	 console.log(createElement(tryInject));
	 //expect(tryInject).to.not.throw(Error);
	 });*/

	it('should fail if store is not provided', () => {

		function App() {
			return h(Provider, null, h(inject('hello')(h('span'))));
		}

		expect(() => render(App(), container)).to.throw(Error, /is not available!/);
	});

	it('should inject stores', () => {

		function App() {
			return h(Provider, {
				testStore: 'works!'
			}, h(inject('testStore')(TestComponent)));
		}

		render(App(), container);
		expect(container.innerHTML).to.equal('<span>works!</span>');
	});

	it('should prefer props over stores', () => {

		function App() {
			return h(Provider, {
				testStore: 'hello'
			}, h(inject('testStore')(TestComponent), { testStore: 'works!' }));
		}

		render(App(), container);
		expect(container.innerHTML).to.equal('<span>works!</span>');
	});

	it('should create class with injected stores', () => {

		class TestClass extends Component {
			render({ hello, world }) {
				return h('span', null, hello + ' ' + world);
			}
		}

		TestClass.defaultProps = {
			world: 'world'
		}

		function App() {
			return h(Provider, {
				hello: 'hello'
			}, h(inject('hello')(TestClass)));
		}

		render(App(), container);
		expect(container.innerHTML).to.equal('<span>hello world</span>');
	});

});
