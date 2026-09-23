import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const root = path.resolve(import.meta.dirname, 'src');

// Every src/*.html is a page
const pages = Object.fromEntries(
  fs
    .readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [path.basename(file, '.html'), path.join(root, file)])
);

// Replaces `<load src="./sections/header.html" />` with that file's contents (path relative to the including file).
// Partials can include other partials. Editing a partial reloads the page in dev.
function htmlPartials() {
  const LOAD_TAG = /<load\s+src="([^"]+)"\s*\/>/g;
  const inline = (html, dir) =>
    html.replace(LOAD_TAG, (_, src) => {
      const file = path.resolve(dir, src);
      return inline(fs.readFileSync(file, 'utf8'), path.dirname(file));
    });

  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html, { filename }) => inline(html, path.dirname(filename)),
    },
    // Vite doesn't know which pages include a partial, so reload on any HTML change
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (file.endsWith('.html')) server.hot.send({ type: 'full-reload' });
      });
    },
  };
}

// Adds <link rel="preload"> for the bundled fonts so text doesn't wait for the CSS to load them
function preloadFonts() {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: (html, { bundle }) =>
      Object.values(bundle)
        .filter(({ fileName }) => /\.woff2?$/.test(fileName))
        .map(({ fileName }) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `./${fileName}`,
            as: 'font',
            type: `font/${path.extname(fileName).slice(1)}`,
            crossorigin: true,
          },
          injectTo: 'head',
        })),
  };
}

export default defineConfig({
  root,
  base: './',
  publicDir: false,
  plugins: [htmlPartials(), preloadFonts()],
  server: {
    host: true,
    open: true,
  },
  build: {
    outDir: '../public',
    emptyOutDir: true,
    rolldownOptions: {
      input: pages,
      output: { minify: { compress: { dropConsole: true, dropDebugger: true } } },
    },
  },
});
