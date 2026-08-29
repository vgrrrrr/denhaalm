# Haalm Redesign – World Backgrounds

Diese opaken JPGs sind die vollflächige unterste Ebene der neuen Alm-Welt. Sie enthalten keine Tiere, UI, Texte oder Logos.

- `home-alm-{day,evening,night}.jpg` – zentrale persönliche Alm
- `pond-{day,evening,night}.jpg` – echter Teichbereich
- `tree-canopy-{day,evening,night}.jpg` – Baumkronen-/Astbereich
- `cozy-hut-{day,evening,night}.jpg` – Pflege- und Schlafraum
- `map-v2/` – verbindliche Alm-Masterkarte, sechs Kartenanker und 18 Detail-JPGs (sechs Orte × Day/Evening/Night)

Alle Dateien sind 941 × 1672 px. Transparente Vordergrund-Assets (Tiere, Habitatobjekte, Icons, Overlays) bleiben getrennt unter `/haalm/ui/redesign-raster/`.

Empfohlene Layer-Reihenfolge: Hintergrund → Habitatobjekte → Tieranimation → Interaktions-Overlay → UI. Für den Zeitwechsel das jeweilige Day/Evening/Night-Paar per Crossfade wechseln; Night darf keine Route sperren.

Hinweis für den Map-Zoom: `map-v2/map-manifest.json` verbindet die Masterkarte mit den sechs landmarkenbezogenen Detail-Sets über `focus`, `mapRect` und `detailRect`. Die React-Zoom-Route ist in `Alm` verdrahtet; eine mathematische Pixelregistrierung der generierten Detailkamera wird nicht behauptet und bleibt Teil der finalen Browser-Abnahme.
