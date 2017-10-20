// import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/js/carousel.js',
  dest: 'dist/index.js',
  moduleName: 'carousel',
  format: 'umd',
  plugins: [
    nodeResolve({
      jsnext: true,
      browser: true,
    }),
    // commonjs(),
    // buble(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
