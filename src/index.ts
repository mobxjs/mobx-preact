import Provider from './Provider';
import { renderReporter, componentByNodeRegistery } from './makeReactive';
import connect from './connect';

export default {
	Provider,
	connect,
	observer: connect,
	renderReporter,
	componentByNodeRegistery
};
