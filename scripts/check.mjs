import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const apps = JSON.parse(await fs.readFile(path.join(root, 'src/projects.json'), 'utf8'));
const base = (process.env.BASE_PATH || '').replace(/^\/?(.*?)\/?$/, '$1');
const prefix = base ? '/' + base : '';
const problems = [];
const pages = [];

async function files(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return nested.flat();
}

async function checkTarget(reference, from) {
  if (!reference || /^(https?:|mailto:|data:|tel:)/i.test(reference)) return;
  const [urlPath, hash] = reference.split('#');
  const clean = decodeURIComponent((urlPath || '').split('?')[0]);
  let target;
  if (!clean) target = from;
  else if (clean.startsWith('/')) {
    if (prefix && !clean.startsWith(prefix + '/')) {
      problems.push(`${path.relative(dist, from)}: missing base path in ${reference}`);
      return;
    }
    target = path.join(dist, clean.slice(prefix.length));
  } else target = path.resolve(path.dirname(from), clean);
  if (!target.startsWith(dist + path.sep) && target !== dist) {
    problems.push(`Path escapes site: ${reference}`);
    return;
  }
  try {
    if ((await fs.stat(target)).isDirectory()) target = path.join(target, 'index.html');
    await fs.access(target);
    if (hash && target.endsWith('.html')) {
      const html = await fs.readFile(target, 'utf8');
      if (!html.includes(`id="${hash}"`)) problems.push(`Missing anchor ${reference} from ${path.relative(dist, from)}`);
    }
  } catch {
    problems.push(`Broken local reference ${reference} from ${path.relative(dist, from)}`);
  }
}

for (const file of await files(dist)) {
  if (!file.endsWith('.html')) continue;
  pages.push(file);
  const html = await fs.readFile(file, 'utf8');
  assert.match(html, /<html lang="(?:de|en)">/, `Missing language: ${file}`);
  assert.match(html, /<title>[^<]+<\/title>/, `Missing title: ${file}`);
  assert.match(html, /<link rel="canonical"/, `Missing canonical: ${file}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${file}`);
  for (const match of html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)) await checkTarget(match[1].replaceAll('&amp;', '&'), file);
}

for (const lang of ['de', 'en']) {
  const home = await fs.readFile(path.join(dist, lang, 'index.html'), 'utf8');
  assert.equal((home.match(/class="vd-spot"/g) || []).length, 6, 'Overview must show all six apps');
  for (const app of apps) {
    const html = await fs.readFile(path.join(dist, lang, app.id, 'index.html'), 'utf8');
    assert.equal((html.match(/<h1>/g) || []).length, 1, `App page must have one h1: ${app.id}`);
    assert.equal((html.match(/class="vd-other"/g) || []).length, 5, `App page must link to five peers: ${app.id}`);
    assert.ok(html.includes(`href="${prefix}/${lang === 'de' ? 'en' : 'de'}/${app.id}/"`), 'Language switch must preserve the app');
    assert.ok(html.includes(`hreflang="${lang === 'de' ? 'en' : 'de'}"`), 'Missing language alternate');
    if (app.wip) assert.ok(!html.includes('/releases/latest'), `Preview must not offer a release: ${app.id}`);
    else assert.ok(html.includes(`https://github.com/vordenken/${app.repo}/releases/latest`), `Missing download: ${app.id}`);
    if (app.local) assert.ok(!html.includes('https://github.com/vordenken/stimmig'), 'Do not advertise the empty source repository');
  }
}

for (const app of apps) {
  const html = await fs.readFile(path.join(dist, app.id, 'index.html'), 'utf8');
  assert.ok(html.includes(`0;url=${prefix}/en/${app.id}/`), `Wrong short entry: ${app.id}`);
  assert.ok(html.includes(`href="${prefix}/en/${app.id}/"`), 'Entry needs a fallback link');
}

const cssFile = path.join(dist, 'assets/site.css');
const css = await fs.readFile(cssFile, 'utf8');
assert.ok(!/@import\s|url\(['"]?https?:/.test(css), 'Fonts and CSS must be self-hosted');
for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) await checkTarget(match[1], cssFile);
assert.ok(css.includes('[hidden]{display:none!important}'), 'Interactive hidden states must remain hidden');
assert.ok(!/<video[^>]*\bautoplay/i.test((await Promise.all(pages.map(file => fs.readFile(file, 'utf8')))).join('')), 'Media must not autoplay');
assert.ok((await fs.stat(path.join(dist, 'assets/fonts/OFL.txt'))).size > 1000, 'Missing font license');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else console.log(`Checked ${pages.length} HTML pages: local links, media, language routes, short entries, preview status, and self-hosted fonts.`);
