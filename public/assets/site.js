const header = document.querySelector('[data-site-header]');
if (header) {
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty('--vd-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  };
  updateHeaderHeight();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateHeaderHeight).observe(header);
}

document.querySelectorAll('[data-demo]').forEach(demo => {
  const de = demo.dataset.language === 'de';
  const text = (german, english) => de ? german : english;
  const announce = message => { demo.querySelector('[data-announcement]').textContent = message; };

  demo.addEventListener('click', event => {
    const tab = event.target.closest('[data-pip]');
    if (tab) {
      const floating = tab.dataset.pip === 'notes';
      demo.querySelector('[data-pip-watch]').hidden = floating;
      for (const selector of ['[data-pip-notes]', '[data-pip-floating]', '[data-pip-status]']) demo.querySelector(selector).hidden = !floating;
      demo.querySelectorAll('[data-pip]').forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
      announce(floating ? text('Der Tab wurde gewechselt. Das Video bleibt im Bild-in-Bild sichtbar.', 'The tab changed. The video stays visible in Picture-in-Picture.') : text('Das Video ist wieder im ursprünglichen Tab.', 'The video is back in its original tab.'));
    }

    const audio = event.target.closest('[data-audio-toggle]');
    if (audio) {
      const muted = audio.getAttribute('aria-pressed') !== 'true';
      audio.setAttribute('aria-pressed', String(muted));
      audio.textContent = muted ? text('Demo zurücksetzen', 'Reset demo') : text('Kopfhörer trennen', 'Disconnect headphones');
      demo.querySelector('[data-audio-heading]').textContent = muted ? text('Kopfhörer getrennt', 'Headphones disconnected') : text('Kopfhörer verbunden', 'Headphones connected');
      demo.querySelector('[data-audio-description]').textContent = muted ? text('Silentio übernimmt.', 'Silentio takes over.') : text('Musik läuft über deine Kopfhörer.', 'Music plays through your headphones.');
      demo.querySelector('[data-audio-output]').textContent = muted ? text('Lautsprecher stumm', 'Speakers muted') : text('Deine Musik', 'Your music');
      demo.querySelector('[data-audio-playback]').textContent = muted ? text('Wiedergabe pausiert', 'Playback paused') : text('Kopfhörer als Audioausgabe', 'Headphones are the audio output');
      demo.classList.toggle('is-muted', muted);
      announce(muted ? text('Die Lautsprecher sind stumm und die Wiedergabe ist pausiert.', 'Speakers are muted and playback is paused.') : text('Die Skizze wurde zurückgesetzt.', 'The sketch has been reset.'));
    }

    const shorts = event.target.closest('[data-shorts-toggle]');
    if (shorts) {
      const blocked = shorts.getAttribute('aria-pressed') !== 'true';
      shorts.setAttribute('aria-pressed', String(blocked));
      shorts.textContent = blocked ? text('Aktiv', 'On') : text('Aktivieren', 'Turn on');
      demo.querySelector('[data-shorts-items]').hidden = blocked;
      demo.querySelector('[data-shorts-clean]').hidden = !blocked;
      announce(blocked ? text('Shorts sind ausgeblendet. Die anderen Videos bleiben sichtbar.', 'Shorts are hidden. The other videos remain visible.') : text('Shorts sind wieder sichtbar.', 'Shorts are visible again.'));
    }
  });
});
