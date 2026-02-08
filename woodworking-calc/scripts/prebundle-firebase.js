import { build } from 'esbuild';

await build({
  entryPoints: ['src/firebase-raw.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: 'src/firebase.js',
  external: [],
  minify: true,
  logLevel: 'info',
});
