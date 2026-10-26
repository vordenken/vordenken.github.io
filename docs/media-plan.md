# Product recording plan

The first version already has a useful static poster or interactive sketch for every app. Replace these only with real product captures; keep the explanatory copy available without playback.

| App | Recording | Approximate duration |
|---|---|---|
| Silentio | Play music through headphones, disconnect them, show built-in speakers muted and playback paused. | 6–8 seconds |
| CoreTamer | Use a disposable test workload, select its process, apply a limit, show the change. Label sample readings; do not throttle unrelated real apps. | 8–12 seconds |
| AutoPiP | Use a self-owned or suitably licensed video in Safari, switch tabs, show PiP, return to the video tab. | 8–10 seconds |
| ShortBlock | Show the same YouTube feed with the extension off, then on. | 6–8 seconds |
| Varan | Open a demo instance, select a stack, open logs. Add a Mac capture when ready. | 10–12 seconds |
| stimmig | Focus a text field, use the dictation shortcut, dictate a short sentence, show the locally refined result at the cursor. | 8–12 seconds |

## Add recordings

Put local `.mp4` or `.webm` files in `public/assets/videos/`, and posters in `public/assets/images/`. On the app object in `src/projects.json`, add:

```json
"video": {
  "src": "assets/videos/autopip.mp4",
  "poster": "assets/images/autopip-poster.jpg",
  "caption": ["AutoPiP in Safari", "AutoPiP in Safari"],
  "tracks": [
    {"language": "de", "src": "assets/videos/autopip-de.vtt"},
    {"language": "en", "src": "assets/videos/autopip-en.vtt"}
  ]
}
```

The generator supports this optional field. Use browser-native controls and a poster, with `preload="none"`; recordings do not autoplay. Provide VTT captions when the recording conveys speech. Capture each app without private names, instance URLs, tokens, notifications, or unrelated personal content. Keep Varan and stimmig labeled as previews until their release status actually changes.
