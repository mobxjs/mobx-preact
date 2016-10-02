import Provider from './Provider';
import { renderReporter, componentByNodeRegistery } from './reactiveMixin';
import connect from './connect';
/*
const observer = connect;
export {Provider};
export {connect};
export {observer};
export {renderReporter};
export {componentByNodeRegistery};*/

export default {
	Provider,
	connect,
	observer: connect,
	renderReporter,
	componentByNodeRegistery
};
