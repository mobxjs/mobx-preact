const path = require('path')
const filesize = require('rollup-plugin-filesize')
const babel = require('rollup-plugin-babel')

const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')

const { uglify } = require('rollup-plugin-uglify')
const { rollup } = require('rollup')

function build(format, filename, { min = false } = {}) {

    const plugins = [
        babel({
            exclude: 'node_modules/**',
            "presets": [
                [ "es2015-rollup" ],
                "stage-1"
              ],
              "plugins": [
                [ "transform-react-jsx", { "pragma": "h" }],
                "transform-decorators-legacy"
              ],
            babelrc: false,
        }),
        resolve({
            module: true,
            main: true,
        }),
        commonjs(),
    ]

    if (min) {
        plugins.push(
            uglify({
                ie8: false,
                warnings: false
            })
        )
    }

    plugins.push(filesize())

    return rollup({    
        input: 'src/index.js',
        external: ['preact', 'mobx'],
        plugins: plugins
    }).then(bundle => {
        const options = {
            file: path.resolve(process.cwd(), 'lib', filename),
            format,
            name: 'mobxPreact',
            exports: 'named',
            globals: {
                preact: 'preact',
                mobx: 'mobx'
            },
        }

        return bundle.write(options);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

Promise.all([
    build('umd', 'index.js'),
    build('umd', 'index.min.js', { min :true }),
    build('es', 'index.module.js'),
]);