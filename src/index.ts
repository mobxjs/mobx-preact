import Provider from './Provider';
import { renderReporter, componentByNodeRegistery } from './makeReactive';
import connect from './connect';

export {
	Provider,
	connect,
	connect as observer,
	renderReporter,
	componentByNodeRegistery
}
export default {
	Provider,
	connect,
	observer: connect,
	renderReporter,
	componentByNodeRegistery
};
