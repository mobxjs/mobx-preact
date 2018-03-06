// rollup.config.js
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// I couldn't get Babel + decorators working with rollup, so babel is handled externally.
// See `npm run build:sample` script

export default {
    input: 'sample/dist/sample.es5.js',
    output: {
        name: 'mobxPreactSample',
        file: 'sample/dist/sample.bundle.js',
        format: 'iife',    
    },    
    plugins: [
        // Example of how to set production mode:
        // replace({
        //     'process.env.NODE_ENV': "'production'",
        // }),
        resolve(),
        commonjs(),

    ],
};