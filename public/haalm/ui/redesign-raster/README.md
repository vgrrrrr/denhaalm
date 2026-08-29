# Haalm App General V2 – Raster Assets

Dies ist die neue, verbindliche Asset-Schicht für die Haalm-Redesign-UX. Alle neuen Dateien sind PNGs mit echtem Alpha-Kanal und transparentem Hintergrund. Es gibt hier keine SVGs.

Aktueller Umfang: 34 PNGs inklusive der fünf Bottom-Nav-Icons.

## Ordner

- `icons/` – Münze, Shop, Parent-Gate und QR-Scan
- `care/` – Futter, Medizin, Waschen, Kuscheln und Schlafen
- `overlays/` – Belohnung, Freischaltung, Gesundheit, Krankheit und Tageszeit
- `accessories/` – Schal, Hut, Brille, Schleife und Tasche als separat platzierbare Layer
- `habitats/` – Teichkante, Baumast und Hütte als freigestellte Weltobjekte
- `learning/` – ABC, Farben, Geräusche, Spuren und Lernabzeichen
- `games/` – Tierauswahl und Spielbelohnung
- `navigation/` – fünf kleine Bottom-Nav-Icons (`home`, `play`, `alm`, `herd`, `profile`)

## Produktionsregeln

- Ausgabegröße der generierten Assets: mindestens 1254 px; breite Habitat-/Lernmotive werden mit 1536 px oder mehr geführt.
- Navigation wird separat optimiert: 64 × 64 px PNG-Quelle, im aktuellen Code bei 21 px CSS gerendert; pro Icon ca. 4–8 KB statt der großen Arbeitsquellen.
- Alpha-Kanal geprüft; halbtransparente Kanten sind für weiche Freistellungen erlaubt, undurchsichtige Flächen außerhalb des Motivs nicht.
- Vor der Einbindung in die App jedes Motiv auf drei Zielgrößen prüfen: 24–32 px (Icon), 64–96 px (Karte/CTA), 160–280 px (Overlay/Interaktion).
- Zubehör bleibt ein eigener Layer und wird nie in Tier-PNGs eingebrannt. Die genaue Position muss pro Tier gegen die Anchors `head`, `neck`, `back`, `paw_front` abgenommen werden.
- Die Bilder sind bewusst ohne Text erzeugt. Lokalisierter UI-Text bleibt im Code.

## Einpassungsprüfung

Die sichtbaren Motive wurden gegen die vorhandene Haalm-Referenz (Pastell-Mountain-World, weiche Plush-/Clay-Oberflächen, Creme/Meadow/Sky/Berry/Lavender/Honey) geprüft. Eine direkte App-Kopie liegt bereits unter `denhaalm/public/haalm/ui/redesign-raster/`; für das finale App-Review müssen sie dort zusätzlich in den realen Screens `Home`, `Care`, `Scan`, `Play`, `Herd` und `Profile` bei Mobile- und Desktop-Breite eingesetzt werden.

Die vorherige SVG-Arbeitsfassung liegt unverändert und nur zur Rückverfolgbarkeit in `../app_general_v1_rejected_svg/`; sie ist nicht für die Umsetzung vorgesehen.
