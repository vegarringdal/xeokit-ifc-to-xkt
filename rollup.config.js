import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import {terser} from "rollup-plugin-terser";

export default {
    input: './index.js',
    output: [
        {
            file: './dist/xeokit-ifc-to-xkt.cjs.js',
            format: 'cjs',
            name: 'bundle'
        }
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        terser()
    ]
}