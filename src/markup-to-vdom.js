import parseMarkup from './parse-markup';
import toVdom from './to-vdom';

const EMPTY_OBJ = {};

/** Convert markup into a virtual DOM.
*	@param {String} markup		HTML or XML markup (indicate via `type`)
*	@param {String} [type=xml]	A type to use when parsing `markup`. Either `xml` or `html`.
*	@param {Function} reviver	The JSX/hyperscript reviver (`h` function) to use. For example, Preact's `h` or `ReactDOM.createElement`.
*	@param {Object} [map]		Optional map of custom element names to Components or variant element names.
 */
export default function markupToVdom(markup, type, reviver, map, options) {
	let dom = parseMarkup(markup, type);

	if (dom && dom.error) {
		throw new Error(dom.error);
	}

	let body = dom && dom.body || dom;
	visitor.map = map || EMPTY_OBJ;
	let vdom = body && toVdom(body, visitor, reviver, options);
	visitor.map = null;


	return vdom && vdom.children || null;
}

function toCamelCase(name) {
	return name.replace(/-(.)/g, (match, letter) =>letter.toUpperCase())
}

function visitor(node) {
	let name = node.nodeName.toLowerCase(),
		map = visitor.map;
	if (map && map.hasOwnProperty(name)){
		node.nodeName = map[name];
		node.attributes = Object.keys(node.attributes).reduce((attrs,attrName)=>{
			attrs[toCamelCase(attrName)] = node.attributes[attrName];
			return attrs;
		},{})
	} else {
		node.nodeName =  name.replace(/[^a-z0-9-]/i,'');
	}

}
