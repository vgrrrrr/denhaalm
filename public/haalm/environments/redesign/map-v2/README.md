# Alm Map v2 – Runtime-Paket

Dieses Verzeichnis ist das Runtime-Ziel für die neue Alm-Navigation. `alm-map-v2-day.jpg` ist die verbindliche Masterkarte; `alm-map-v2-evening.jpg` und `alm-map-v2-night.jpg` sind dazu geometrisch identische Lichtvarianten.

Unter `scenes/` liegen 18 optimierte JPGs (sechs Bereiche × Day/Evening/Night), jeweils 941×1672 px und Qualität 82. Die Pfade, Fokuskoordinaten, Map-Rechtecke, Landmarken und Übergangswerte stehen in [`map-manifest.json`](map-manifest.json).

Die Dateien sind absichtlich deckende Rasterbilder. Tier-Cutouts, Navigations-Icons und andere UI-Assets werden separat geladen; es gibt in diesem Paket keine SVGs und keine eingebrannten UI-Texte.
