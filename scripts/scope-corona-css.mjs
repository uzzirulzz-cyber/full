import fs from 'node:fs';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';

const sourcePath = new URL('../src/admin-corona/corona.source.css', import.meta.url);
const outputPath = new URL('../src/admin-corona/corona.css', import.meta.url);
const source = fs.readFileSync(sourcePath, 'utf8').replaceAll(
  '/demo/corona-react-free/template/demo_1/preview/static/media/',
  '/assets/corona/media/',
);

const result = await postcss([
  prefixer({
    prefix: '.corona-admin',
    transform(prefix, selector, prefixedSelector) {
      const trimmed = selector.trim();
      if (trimmed === 'html' || trimmed === 'body' || trimmed === ':root') return prefix;
      if (/\bbody\b/.test(trimmed)) return trimmed.replace(/\bbody\b/, prefix);
      return prefixedSelector;
    },
  }),
]).process(source, { from: undefined });

fs.writeFileSync(outputPath, result.css, 'utf8');
