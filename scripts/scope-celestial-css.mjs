import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';

const root = process.cwd();
const sources = [
  ['src/celestial-admin/vendor.source.css', 'vendors/css/vendor.bundle.base.css'],
  ['src/celestial-admin/typicons.source.css', 'vendors/typicons.font/font/typicons.css'],
  ['src/celestial-admin/style.source.css', 'css/vertical-layout-light/style.css'],
];

function rewriteUrls(css, originalPath) {
  return css.replace(/url\(([^)]+)\)/g, (match, rawValue) => {
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '');
    if (!value || value.startsWith('data:') || value.startsWith('http') || value.startsWith('/')) return match;
    const clean = value.split(/[?#]/)[0];
    const suffix = value.slice(clean.length);
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(originalPath), clean));
    return `url("/assets/celestial/${resolved}${suffix}")`;
  });
}

let output = '';
for (const [sourcePath, originalPath] of sources) {
  const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
  const result = await postcss([
    prefixer({
      prefix: '.celestial-admin',
      transform(prefix, selector, prefixedSelector) {
        const trimmed = selector.trim();
        if (trimmed === 'html' || trimmed === 'body' || trimmed === ':root') return prefix;
        if (/\bbody(?![\w-])/.test(trimmed)) return trimmed.replace(/\bbody(?![\w-])/g, prefix);
        return prefixedSelector;
      },
    }),
  ]).process(rewriteUrls(source, originalPath), { from: undefined });
  output += `${result.css}\n`;
}

fs.writeFileSync(path.join(root, 'src/celestial-admin/celestial.css'), output, 'utf8');
