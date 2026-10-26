import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
const apps = JSON.parse(await fs.readFile(path.join(root, 'src/projects.json'), 'utf8'));
const origin = (process.env.SITE_URL || 'https://vordenken.github.io').replace(/\/$/, '');
const base = (process.env.BASE_PATH || '').replace(/^\/?(.*?)\/?$/, '$1');
const prefix = base ? '/' + base : '';
const local = value => prefix + '/' + value.replace(/^\//, '');
const absolute = value => origin + local(value);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const repo = app => 'https://github.com/vordenken/' + app.repo;
const copy = (lang, de, en) => lang === 'de' ? de : en;
const value = (lang, values) => values[lang === 'de' ? 0 : 1];
const route = (lang, id = '') => local(lang + '/' + (id ? id + '/' : ''));
const e = escape;
const icon = (app, decorative = false) => `<img class="vd-icon" src="${local('assets/icons/' + app.id + '.png')}" alt="${decorative ? '' : e(app.name)}" width="128" height="128">`;
const external = (href, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${e(href)}">${e(text)}</a>`;
const uiIcon = name => {
  const shapes = {
    play: '<path d="m8 5 11 7-11 7Z"/>',
    pip: '<rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="11" width="8" height="7" rx="1"/>',
    music: '<path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    mute: '<path d="m11 5-6 4H2v6h3l6 4V5ZM17 9l5 6m0-6-5 6"/>',
    headphones: '<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="2" y="12" width="5" height="9" rx="2"/><rect x="17" y="12" width="5" height="9" rx="2"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.play}</svg>`;
};

function header(lang, current) {
  const other = lang === 'de' ? 'en' : 'de';
  return `<a class="vd-skip" href="#main">${copy(lang, 'Zum Inhalt', 'Skip to content')}</a><header class="vd-top vd-wrap"><a class="vd-logo" href="${route(lang)}" aria-label="${copy(lang, 'vordenken – alle Projekte', 'vordenken – all projects')}">vordenken.</a><nav class="vd-toplinks" aria-label="${copy(lang, 'Hauptnavigation', 'Main navigation')}"><a class="vd-quiet" href="${route(lang)}">${copy(lang, 'Alle Projekte', 'All projects')}</a>${external('https://ko-fi.com/vordenken', copy(lang, 'Unterstützen', 'Support'), 'vd-quiet')}<div class="vd-languages" aria-label="${copy(lang, 'Sprache', 'Language')}">${['de', 'en'].map(code => `<a href="${route(code, current)}" lang="${code}" hreflang="${code}"${code === lang ? ' aria-current="true"' : ''}>${code.toUpperCase()}</a>`).join('')}</div></nav></header><nav class="vd-appnav vd-wrap" aria-label="${copy(lang, 'Apps aus der Werkstatt', 'Apps from the workshop')}">${apps.map(app => `<a href="${route(lang, app.id)}"${current === app.id ? ' aria-current="page"' : ''}>${icon(app, true)}<span>${e(app.name)}</span>${app.wip ? `<span class="vd-sr">${copy(lang, 'In Arbeit', 'In development')}</span>` : ''}</a>`).join('')}</nav>`;
}

function footer(lang) {
  return `<footer class="vd-bottom vd-wrap"><span>${copy(lang, 'Von vordenken. Offen entwickelt, offen geteilt.', 'By vordenken. Built openly, shared openly.')}</span><nav class="vd-footer-links" aria-label="${copy(lang, 'Weitere Links', 'Additional links')}">${external('https://github.com/vordenken', 'GitHub')}${external('https://ko-fi.com/vordenken', copy(lang, 'Unterstützen', 'Support'))}<a href="${route(lang, 'privacy')}">${copy(lang, 'Datenschutz', 'Privacy')}</a></nav></footer>`;
}

const dots = '<span class="vd-dot"></span><span class="vd-dot"></span><span class="vd-dot"></span>';
function film(lang) {
  return `<div class="vd-film"><span class="vd-playmark">${uiIcon('play')}${copy(lang, 'Beispielvideo', 'Sample video')}</span></div>`;
}

function media(app, lang) {
  if (app.video) {
    return `<figure class="vd-recording"><video controls playsinline preload="none" poster="${local(app.video.poster)}" aria-label="${e(value(lang, app.video.caption))}"><source src="${local(app.video.src)}" type="${app.video.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">${(app.video.tracks || []).map(track => `<track kind="captions" src="${local(track.src)}" srclang="${e(track.language)}" label="${track.language === 'de' ? 'Deutsch' : 'English'}"${track.language === lang ? ' default' : ''}>`).join('')}<a href="${local(app.video.src)}">${copy(lang, 'Video öffnen', 'Open video')}</a></video><figcaption class="vd-caption">${e(value(lang, app.video.caption))}</figcaption></figure>`;
  }
  if (['coretamer', 'stimmig', 'varan'].includes(app.id)) {
    const descriptions = {
      coretamer: ['CoreTamer: Prozessliste mit CPU-Auslastung und Limit-Spalte', 'CoreTamer process list with CPU usage and limits'],
      varan: ['Varan auf dem iPhone: Serveransicht mit Demo-Daten', 'Varan on iPhone: server view with demo data'],
      stimmig: ['stimmig: Onboarding der Entwicklungsvorschau', 'stimmig development preview onboarding']
    };
    return `<figure><a class="${app.id === 'varan' ? 'vd-phone' : 'vd-appshot'}" href="${local('assets/images/' + app.id + '.jpg')}" aria-label="${copy(lang, 'Screenshot in voller Größe öffnen', 'Open full-size screenshot')}"><img src="${local('assets/images/' + app.id + '.jpg')}" alt="${e(value(lang, descriptions[app.id]))}" ${app.id === 'varan' ? 'width="277" height="600"' : 'width="1000" height="1000"'} decoding="async"></a><figcaption class="vd-caption">${copy(lang, 'Echter App-Screenshot', 'Actual app screenshot')}${app.id === 'varan' ? copy(lang, ' · Demo-Daten', ' · demo data') : app.id === 'stimmig' ? copy(lang, ' · Entwicklungsstand', ' · development preview') : copy(lang, ' · Ausschnitt', ' · cropped')}</figcaption></figure>`;
  }
  const noScript = `<noscript><p class="vd-noscript">${copy(lang, 'Die Skizze zeigt die Ausgangsansicht. Für den interaktiven Vergleich JavaScript aktivieren.', 'The sketch shows the initial view. Enable JavaScript to try the interactive comparison.')}</p></noscript>`;
  if (app.id === 'autopip') {
    return `<figure data-demo="pip" data-language="${lang}"><div class="vd-media"><div class="vd-native-header">${dots}<b>Safari</b></div><div class="vd-tabs"><button type="button" data-pip="video" aria-pressed="true">Video</button><button type="button" data-pip="notes" aria-pressed="false">${copy(lang, 'Notizen', 'Notes')}</button></div><div class="vd-browser-body"><div class="vd-watch" data-pip-watch>${film(lang)}<div class="vd-video-name">${copy(lang, 'Ein Moment draußen', 'A moment outside')}</div><div class="vd-muted">${copy(lang, 'Wechsle oben zu „Notizen“.', 'Switch to “Notes” above.')}</div></div><div class="vd-notes" data-pip-notes hidden><h3>${copy(lang, 'Platz für deine Gedanken.', 'Room for your thoughts.')}</h3><div class="vd-line"></div><div class="vd-line"></div><div class="vd-line short"></div></div><div class="vd-floating" data-pip-floating hidden>${film(lang)}</div><div class="vd-demo-status" data-pip-status hidden>${uiIcon('pip')}<span>${copy(lang, 'Video bleibt sichtbar', 'Video stays in view')}</span></div></div></div><figcaption class="vd-caption">${copy(lang, 'Funktionsskizze · oben den Tab wechseln', 'Interactive sketch · switch tabs above')}</figcaption><span class="vd-sr" aria-live="polite" data-announcement></span>${noScript}</figure>`;
  }
  if (app.id === 'silentio') {
    return `<figure data-demo="audio" data-language="${lang}"><div class="vd-media"><div class="vd-native-header">${dots}<b>Silentio</b></div><div class="vd-audio-stage"><div class="vd-audio-state">${uiIcon('headphones')}<div><strong data-audio-heading>${copy(lang, 'Kopfhörer verbunden', 'Headphones connected')}</strong><span data-audio-description>${copy(lang, 'Musik läuft über deine Kopfhörer.', 'Music plays through your headphones.')}</span></div></div><div class="vd-audio-output">${uiIcon('music')}<div><span data-audio-output>${copy(lang, 'Deine Musik', 'Your music')}</span><small data-audio-playback>${copy(lang, 'Kopfhörer als Audioausgabe', 'Headphones are the audio output')}</small></div></div><button type="button" class="vd-demo-button" data-audio-toggle aria-pressed="false">${copy(lang, 'Kopfhörer trennen', 'Disconnect headphones')}</button></div></div><figcaption class="vd-caption">${copy(lang, 'Funktionsskizze · ohne Audiowiedergabe', 'Interactive sketch · no audio playback')}</figcaption><span class="vd-sr" aria-live="polite" data-announcement></span>${noScript}</figure>`;
  }
  return `<figure data-demo="shorts" data-language="${lang}"><div class="vd-media"><div class="vd-native-header">${dots}<b>${copy(lang, 'Video-Feed', 'Video feed')}</b></div><div class="vd-feedbar"><strong>ShortBlock</strong><button type="button" data-shorts-toggle aria-pressed="false">${copy(lang, 'Aktivieren', 'Turn on')}</button></div><div class="vd-feed"><div><div class="vd-feed-video">${uiIcon('play')}</div><div class="vd-feed-name">${copy(lang, 'Ein gutes Gespräch', 'A good conversation')}</div></div><div><div class="vd-feed-video second">${uiIcon('play')}</div><div class="vd-feed-name">${copy(lang, 'Etwas Neues lernen', 'Learn something new')}</div></div><div class="vd-shorts" data-shorts-items><strong>Shorts</strong><div class="vd-shortrow">${[1, 2, 3].map(() => `<div class="vd-short">${uiIcon('play')}</div>`).join('')}</div></div><div class="vd-clean-note" data-shorts-clean hidden>${uiIcon('check')}${copy(lang, 'Der Feed bleibt. Die Shorts gehen.', 'The feed stays. The Shorts go.')}</div></div></div><figcaption class="vd-caption">${copy(lang, 'Funktionsskizze · ShortBlock umschalten', 'Interactive sketch · toggle ShortBlock')}</figcaption><span class="vd-sr" aria-live="polite" data-announcement></span>${noScript}</figure>`;
}

function spotlight(app, lang, home = false) {
  let primary;
  if (home) primary = `<a class="vd-primary" href="${route(lang, app.id)}">${copy(lang, 'App ansehen', 'Explore app')}</a>`;
  else if (app.local) primary = `<a class="vd-primary" href="#development">${copy(lang, 'Entwicklungsstand', 'Development status')}</a>`;
  else primary = external(app.wip ? repo(app) : repo(app) + '/releases/latest', app.wip ? copy(lang, 'Quellcode ansehen', 'View source code') : copy(lang, 'Download auf GitHub', 'Download on GitHub'), 'vd-primary');
  let secondary = app.local ? external('https://ko-fi.com/vordenken', copy(lang, 'Unterstützen', 'Support'), 'vd-secondary') : external(app.wip && !home ? repo(app) + '/blob/main/BUILD.md' : repo(app), app.wip && !home ? copy(lang, 'Build-Anleitung', 'Build instructions') : copy(lang, 'Quellcode', 'Source code'), 'vd-secondary');
  return `<section class="vd-spot" aria-label="${e(app.name)}"><div><div class="vd-identity">${icon(app)}<div><strong>${e(app.name)}${app.wip ? `<span class="vd-dev">${copy(lang, 'In Arbeit', 'In development')}</span>` : ''}</strong><div class="vd-platform">${e(app.platform)}</div></div></div><${home ? 'h2' : 'h1'}>${e(value(lang, app.title))}</${home ? 'h2' : 'h1'}><p>${e(value(lang, app.description))}</p><div class="vd-ctas">${primary}${secondary}</div><div class="vd-smallprint">${app.wip ? copy(lang, 'Entwicklungsvorschau · noch kein öffentlicher App-Release', 'Development preview · no public app release yet') : copy(lang, 'Kostenlos & Open Source', 'Free & open source')}</div></div><div class="vd-medium">${media(app, lang)}</div></section>`;
}

function related(app, lang) {
  return `<section class="vd-related vd-wrap"><div class="vd-related-title"><h2>${copy(lang, 'Auch aus der Werkstatt', 'Also from the workshop')}</h2><a href="${route(lang)}">${copy(lang, 'Alle Projekte ansehen', 'See all projects')}</a></div><div class="vd-related-grid">${apps.filter(other => other.id !== app.id).map(other => `<a class="vd-other" href="${route(lang, other.id)}">${icon(other, true)}<strong>${e(other.name)}</strong><p>${e(value(lang, other.short))}</p>${other.wip ? `<small>${copy(lang, 'In Arbeit', 'In development')}</small>` : ''}</a>`).join('')}</div></section>`;
}

function appContent(app, lang) {
  const installNote = app.wip ? '' : `<p class="vd-install-note">${copy(lang, 'Falls macOS die App zunächst blockiert, findest du die aktuellen Installationshinweise im ', 'If macOS initially blocks the app, follow the current installation notes in the ')}${external(repo(app) + '#readme', 'README')}${copy(lang, ' des Projekts.', '.')}</p>`;
  return `<div class="vd-breadcrumb vd-wrap"><a href="${route(lang)}">${copy(lang, 'Alle Projekte', 'All projects')}</a><span aria-hidden="true">/</span><span>${e(app.name)}</span></div>${spotlight(app, lang)}<section class="vd-section vd-wrap"><h2>${copy(lang, 'Was ' + e(app.name) + ' für dich übernimmt', 'What ' + e(app.name) + ' does for you')}</h2><div class="vd-benefits">${app.features.map(feature => `<div><h3>${e(copy(lang, feature[0], feature[1]))}</h3><p>${e(copy(lang, feature[2], feature[3]))}</p></div>`).join('')}</div><div class="vd-start" id="development"><div><h2>${app.wip ? copy(lang, 'Was gerade entsteht', 'What’s taking shape') : copy(lang, 'So legst du los', 'Get started')}</h2><ol>${app.steps.map(step => `<li>${e(value(lang, step))}</li>`).join('')}</ol>${installNote}</div><aside class="vd-requirements"><h3>${app.wip ? copy(lang, 'Gut zu wissen', 'Good to know') : copy(lang, 'Das brauchst du', 'What you’ll need')}</h3><p>${e(value(lang, app.requirements))}</p></aside></div></section>${related(app, lang)}`;
}

function document({ lang, title, description, content, current = '', canonical = '', noindex = false }) {
  const url = absolute(canonical || lang + '/' + (current ? current + '/' : ''));
  const image = absolute('assets/icons/' + (apps.some(a => a.id === current) ? current : 'coretamer') + '.png');
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#eee9f7" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#24192e" media="(prefers-color-scheme: dark)">${noindex ? '<meta name="robots" content="noindex">' : ''}<link rel="canonical" href="${url}">${['de', 'en'].map(code => `<link rel="alternate" hreflang="${code}" href="${absolute(code + '/' + (current ? current + '/' : ''))}">`).join('')}<link rel="alternate" hreflang="x-default" href="${absolute('en/' + (current ? current + '/' : ''))}"><meta property="og:type" content="website"><meta property="og:site_name" content="vordenken"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${lang === 'de' ? 'de_DE' : 'en_US'}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary"><link rel="icon" href="${local('assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${local('assets/site.css')}"><script src="${local('assets/site.js')}" defer></script></head><body><div id="vd-workshop">${header(lang, current)}<main id="main">${content}</main>${footer(lang)}</div></body></html>\n`;
}

async function write(relative, content) {
  const file = path.join(out, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

function redirect(target, name) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=${e(target)}"><title>${e(name)} · vordenken</title><link rel="canonical" href="${origin + target}"><meta name="robots" content="noindex"><link rel="stylesheet" href="${local('assets/site.css')}"></head><body><main class="vd-redirect"><h1>${e(name)}</h1><p><a href="${e(target)}">Continue in English</a></p><p><a href="${e(target.replace('/en/', '/de/'))}">Auf Deutsch öffnen</a></p></main></body></html>\n`;
}

await fs.rm(out, { recursive: true, force: true });
await fs.cp(path.join(root, 'public'), out, { recursive: true });
const sitemap = [];
for (const lang of ['de', 'en']) {
  const title = copy(lang, 'vordenken · Kleine Ideen. Gute Werkzeuge.', 'vordenken · Small ideas. Useful tools.');
  const description = copy(lang, 'Native Open-Source-Apps für Mac, Safari, iPhone und iPad. Entdecke Silentio, CoreTamer, AutoPiP, ShortBlock, Varan und stimmig.', 'Native open-source apps for Mac, Safari, iPhone, and iPad. Discover Silentio, CoreTamer, AutoPiP, ShortBlock, Varan, and stimmig.');
  const content = `<div class="vd-home-intro vd-wrap"><h1 class="vd-home-title">${copy(lang, 'Kleine Ideen.\nGute Werkzeuge.', 'Small ideas.\nUseful tools.')}</h1><p>${copy(lang, 'Native Open-Source-Apps für deinen Mac, Safari und darüber hinaus. Entdecke, was schon da ist – und was gerade entsteht.', 'Native open-source apps for your Mac, Safari, and beyond. Discover what’s ready to use and what’s taking shape.')}</p></div><div class="vd-home-modules">${apps.map(app => spotlight(app, lang, true)).join('')}</div>`;
  await write(lang + '/index.html', document({ lang, title, description, content }));
  sitemap.push(lang + '/');
  for (const app of apps) {
    await write(lang + '/' + app.id + '/index.html', document({ lang, current: app.id, title: `${app.name} · ${value(lang, app.title).replaceAll('\n', ' ')} · vordenken`, description: value(lang, app.description), content: appContent(app, lang) }));
    sitemap.push(lang + '/' + app.id + '/');
  }
  const privacyTitle = copy(lang, 'Datenschutz', 'Privacy');
  const privacyContent = `<article class="vd-prose vd-wrap"><h1>${privacyTitle}</h1><p>${copy(lang, 'Diese Website stellt die Open-Source-Projekte von vordenken vor. Sie verwendet keine Analysewerkzeuge, keine Tracking-Pixel und keine Cookies zur Besucheranalyse.', 'This website introduces vordenken’s open-source projects. It uses no analytics tools, tracking pixels, or analytics cookies.')}</p><h2>${copy(lang, 'Hosting', 'Hosting')}</h2><p>${copy(lang, 'Die Website wird von GitHub Pages ausgeliefert. Beim Aufruf verarbeitet GitHub technische Zugriffsdaten, darunter IP-Adressen. Einzelheiten stehen in der ', 'The website is served by GitHub Pages. When you visit, GitHub processes technical access data, including IP addresses. Details are provided in the ')}${external('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', copy(lang, 'Datenschutzerklärung von GitHub', 'GitHub General Privacy Statement'))}.</p><h2>${copy(lang, 'Schriften und Medien', 'Fonts and media')}</h2><p>${copy(lang, 'Schriften, Bilder und Funktionsskizzen werden mit der Website ausgeliefert. Es werden keine externen Videoplayer oder Schriftendienste eingebunden. Die Funktionsskizzen reagieren nur lokal in deinem Browser und speichern keine Daten.', 'Fonts, images, and interactive sketches are served with the website. No third-party video players or font services are embedded. The sketches run locally in your browser and store no data.')}</p><h2>${copy(lang, 'Externe Links', 'External links')}</h2><p>${copy(lang, 'Wenn du einem Link zu GitHub oder Ko-fi folgst, gilt die Datenschutzerklärung des jeweiligen Dienstes. Die Apps selbst haben eigene Datenschutzhinweise in ihren Repositories.', 'If you follow a link to GitHub or Ko-fi, the respective service’s privacy policy applies. The apps themselves have their own privacy notices in their repositories.')}</p><p>${external('https://github.com/vordenken', copy(lang, 'Kontakt über das GitHub-Profil', 'Contact through the GitHub profile'))}</p><p><a href="${route(lang)}">${copy(lang, 'Zurück zu allen Projekten', 'Back to all projects')}</a></p></article>`;
  await write(lang + '/privacy/index.html', document({ lang, current: 'privacy', title: privacyTitle + ' · vordenken', description: copy(lang, 'Datenschutzhinweise für die vordenken-Werkstatt.', 'Privacy information for the vordenken workshop.'), content: privacyContent }));
  sitemap.push(lang + '/privacy/');
}
await write('index.html', redirect(route('en'), 'vordenken'));
for (const app of apps) await write(app.id + '/index.html', redirect(route('en', app.id), app.name));
await write('404.html', document({ lang: 'en', title: 'Page not found · vordenken', description: 'Find all apps from the vordenken workshop.', canonical: '404.html', noindex: true, content: `<article class="vd-prose vd-wrap"><h1>This page isn’t here.</h1><p>Find the app you’re looking for in the workshop.</p><p><a href="${route('en')}">All projects in English</a></p><p><a href="${route('de')}">Alle Projekte auf Deutsch</a></p></article>` }));
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map(url => `<url><loc>${e(absolute(url))}</loc></url>`).join('')}</urlset>\n`);
await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
await write('.nojekyll', '');
console.log(`Built ${sitemap.length} localized pages, 7 entry points, and a 404 page in dist/`);
