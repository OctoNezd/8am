import "element-internals-polyfill"
import prefersColorSchemeInit from 'css-prefers-color-scheme/browser';
const prefersColorScheme = prefersColorSchemeInit('dark', { debug: true });
console.log(prefersColorScheme);
console.log("colorscheme:", prefersColorScheme.hasNativeSupport, prefersColorScheme.scheme )