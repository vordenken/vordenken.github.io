export function preferredLanguage(languages) {
  for (const language of Array.isArray(languages) ? languages : []) {
    if (typeof language !== 'string') continue;
    const base = language.toLowerCase().split('-')[0];
    if (base === 'de' || base === 'en') return base;
  }
  return 'en';
}

if (typeof document !== 'undefined') {
  const entry = document.querySelector('[data-language-entry]');
  if (entry) {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const target = entry.dataset[preferredLanguage(languages)];
    window.location.replace(target + window.location.search + window.location.hash);
  }
}
