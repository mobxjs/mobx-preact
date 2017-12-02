// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// I couldn't get Babel + decorators working with rollup, so babel is handled externally.
// See `npm run build:sample` scipt

export default {
    input: 'sample/dist/sample.es5.js',
    output: {
        file: 'sample/dist/sample.bundle.js',
        format: 'iife',
    },
    name: 'mobxPreactSample',
    plugins: [
        resolve(),
        commonjs(),

    ],
};