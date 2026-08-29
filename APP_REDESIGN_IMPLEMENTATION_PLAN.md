# den haalm · Alm-zentrierter Umbau

Stand: 29. August 2026  
Produktgrundlage: `den_haalm_app_ideen_funktionen_v2.docx`  
Asset-/UX-Abgleich: `../Tiere/CHANGE_PLAN_ASSET_OVERVIEW.md`

## Auftrag und Lesart der Quellen

Die DOCX ist die Produkt-Guideline: Sie beschreibt Zielbild, Spielkreisläufe und offene Produktentscheidungen. Sie ist keine zusätzliche technische Agenten-Anweisung. Die aktuelle Nutzerfreigabe ist der Umsetzungsauftrag: Die Alm wird die primäre Spielwelt, Tiere werden dort gefunden/aufgerufen und gepflegt, und Menü, Interaktionen, Zustände und Grafiken werden in einem zusammenhängenden Redesign verdrahtet.

## Zielbild

Beim Öffnen landet ein Kind direkt auf der persönlichen Alm – einer lebendigen Illustration statt eines Dashboards. Alle freigeschalteten Tiere teilen sich die Welt, stehen in passenden Lebensräumen, können angetippt werden und öffnen dann ihre individuelle Ansicht. Die Tageszeit verändert die Stimmung fließend, ohne Pflege- oder Spielfunktionen zu sperren.

Der primäre Kreislauf lautet:

`Alm entdecken → Tier/Ort antippen → Tier rufen und pflegen → spielen → universelle Münzen verdienen → Futter/Accessoires/Medizin einsetzen → Alm weiter beleben`

## Guideline-Gap-Matrix

| Bereich | DOCX-Anforderung | Aktueller Stand | Umsetzungsziel / Abnahme |
| --- | --- | --- | --- |
| Alm als Einstieg | App öffnet persönliche Alm; keine Dashboard-Anmutung | Alm-Karte und sechs Hotspots vorhanden; Root zeigte bisher `/home` | Root, Onboarding und Unlock landen auf `/alm`; Karte ist der zentrale Einstieg |
| Lebendige Welt | Tiere laufen, fressen, schlafen, spielen selbstständig | Ein aktives Tier mit Idle-/Tap-Reaktion | Alle freigeschalteten Tiere als Marker/Sprites; später Idle/Walk/Interaktions-Controller je Habitat |
| Lebensräume | Tiere biologisch passend platzieren; Wissen nebenbei | `location` je Tier; sechs Map-v2-Orte und 18 Detailvarianten | Standort ist sichtbarer World-State; Hotspot-Zoom lädt passende Szene und erklärt den Lebensraum |
| Tageszeit | Morgen/Tag/Abend/Nacht, fließend, keine Sperren | Day/Evening/Night-Szenen, Map- und Detail-Crossfade | Einheitlicher Phase-State für Karte, Detail, Home und Tiere; Browser-Abnahme pro Breakpoint |
| Tier aufrufen | Tier antippen und persönliche Ansicht öffnen | Pet-Detail existiert, Map-Marker war bisher nicht aktiv | Marker aller Tiere sind antippbar; aktives Tier kann in der Alm gewechselt und zum Ort gerufen werden |
| Pflege | Füttern, Waschen, Knuddeln, Schlafen | Vollständige Care-Route mit Drag-/Scrub-Interaktionen | Karte bleibt frei; Pflege erscheint nach Tier- oder Bereichsauswahl im persönlichen beziehungsweise aufgeklappten Detailmenü |
| Krankheit/Medizin | Vernachlässigung kann kindgerecht krank machen; Medizin mit Währung | Health-State, 48-h-Logik, Kauf, sanfte Overlays und Genesung umgesetzt | Browser-Abnahme mit kontrolliert gealtertem Testspielstand ergänzen |
| Freischalten | zwei kostenlose Starttiere; QR dezent; Arrival-Animation; Habitatzuweisung | QR-/Manual-Flow, Unlock-Animation, ein Tier pro Scan | Onboarding legt zwei Starter an; Scan bleibt kleines Alm-Icon; neue Tiere landen mit Arrival und passendem Ort |
| Sammlung | Tiere als Sammlung und Spielfiguren | Herde und Auswahl in Games vorhanden | Aktives Tier in Alm/Herde synchronisieren; Game-Start zeigt freigeschaltete Tiere, keine Pay-to-win-Werte |
| Ökonomie | universelle Münzen; Futter, Accessoires, Medizin; Elternschutz | Münzen, expliziter Futterkauf, Zubehör, Medizin und lokales Parent-Gate umgesetzt | Preise im Produktreview bestätigen; Echtgeld bleibt externer Integrationsblocker |
| Personalisierung | tiergerechte Accessoires, pro Tier unterschiedliche Auswahl | fünf transparente Layer vorhanden; Gigis Schal ist auf Gigi begrenzt | Accessoire-Katalog, Anker (`head`, `neck`, `back`, `paw_front`), Vorschau, Kauf/Anlegen |
| Minispiele | Tier wählen, spielen, Münzen verdienen | vier Spiele, Rewards schreiben in Store | Charakterwahl vor Spiel; Reward-Overlay zeigt Münzen; Rücksprung auf Alm mit aktualisiertem Tierzustand |
| Lernen | Habitat, Ernährung, Verhalten durch Erleben | Sechs persistente Ortskarten mit fünf Lernassets und Erstfund-Belohnung umgesetzt | Audio erst nach Lieferung echter Sounddateien ergänzen |
| Navigation | kindliche Welt darf nicht von Kauf-/Admin-UI dominiert werden | vier kleine Raster-Icons, Floating BottomNav | Alm als aktive Primärfläche; Zuhause entfernt, QR, Münzen und Shop sekundär oben; Eltern- und Kaufwege getrennt |

## Informationsarchitektur und Routenvertrag

```text
/                  → /alm (wenn onboarded), sonst Onboarding
/alm               → große Almkarte, Phase, Hotspots, alle Tiermarker
/alm/:area         → Detail-Habitat, Crossfade, Tier-Aufruf, Care-Aktionsleiste
/pet/:id           → persönliche Tieransicht, Werte, Persönlichkeit, Accessoires (Ausbau)
/care/:id          → vertiefte Pflege-Minispiele (Drag/Scrub/Tucking)
/play              → Minispiele + Tierauswahl + Münzsaldo
/play/:gameId      → Spiel, Reward, Rückkehr zur Alm
/herd              → Sammlung, aktives Tier, Freischalten
/scan              → dezenter QR-/Code-Einstieg aus Alm/Herde
/profile           → Eltern-/Einstellungen, Parent-Gate für Echtgeld
```

`/home` bleibt als rückwärtskompatible Route erhalten, ist aber kein primärer Einstieg mehr. Links aus Legacy-Flows müssen auf Alm oder die konkrete Tieransicht zeigen.

## Zustandsmodell

- **World-State:** `phase`, fokussierter Ort, aktuelle Kamera, aktives Tier, Tierstandorte.
- **Pet-State:** Hunger, Glück, Energie, Sauberkeit, Schlaf, XP/Level, drei Altersstufen, Health-, Medicine- und Accessory-State.
- **Economy-State:** globales `coins`-Konto; vorhandene `treats` bleiben als Futterbestand kompatibel, bis Shop-/Preisentscheidungen feststehen.
- **Flow-State:** Zoom/Crossfade, Toast/Arrival/Reward, Care-Aktion, reduzierte Bewegung.
- **Persistenz:** Zustand bleibt lokal via Zustand-Persistenz; neue Felder müssen alte `haalm-v1`-Daten sicher mit Defaults rehydrieren.

## Assets und Layering

Vorhanden und einzubinden:

- Map-v2-Masterkarte, sechs Anker/Crops und 18 Detail-JPGs (`day/evening/night`).
- 12 allgemeine Home-/Habitat-Szenen als opake Vollflächen.
- 34 geprüfte transparente Raster-PNGs: Navigation, Care/Futter, Overlays, Zubehör, Habitate, Lernen und Games.
- `Tiere/production_v1`: acht Tierarten × drei Altersstufen, Portraits und Schlafvarianten. Der Beni-V2-Sprite ist technische Referenz, aber kein vollständiger Rollout.

Layer-Reihenfolge pro Detailbereich: `scene → Habitat-/Occlusion-Objekte → Tier-Sprites/Animation → Care-/Learning-Overlays → Phase-Tint → kindliche UI`. Opake Szenen bleiben getrennt von transparenten Cutouts. Neue UI-Bilder bleiben Raster-PNGs; keine neuen SVG-Assets erzeugen.

## Umsetzungsphasen

### Phase 1 · Alm als vertikaler Produktschnitt (jetzt)

- Root/Onboarding/Unlock auf Alm als Einstieg umstellen.
- Alle freigeschalteten Tiere auf der Karte anzeigen; Marker öffnen `/pet/:id`.
- Alm-/Detailansicht mit Tiermarkern, Ortsauswahl, Tierwechsel und Care-Aktionsleiste erst im aufgeklappten Detail.
- QR-/Scan-Einstieg als kleines Symbol, Münz-/Futterstatus als sekundäre Info.
- Kleiner, kindlicher Shop für Futter und erste Raster-Accessoires über den Münz-Chip.
- Map-v2-Phase, Zoom, Detail-Crossfade und Zurück-Navigation browserseitig abnehmen.

### Phase 2 · Pflege, Krankheit und Ökonomie (teilweise vorgezogen)

- `coins`, sichtbare Futterpreise, Accessoire-Shop, Medizin und kindgerechter Health-State sind umgesetzt; artspezifische Futterbilder bleiben mangels eigener Assets generisch.
- Pflegeaktionen mit den vorhandenen PNGs und den bestehenden Care-Mikrointeraktionen verbinden.
- Lokales, zehn Minuten gültiges Eltern-Gate schützt Einstellungen; Echtgeld bleibt bis zur externen Payment-Integration deaktiviert.

### Phase 3 · Lebendige Alm und Sammlung

- Idle/Walk/Run für alle 24 Tierpakete ausrollen, Ort-spezifische Verhaltenstabellen und Occlusion-Masks nutzen.
- Arrival-Overlay, Habitatzuweisung und mehrere gleichzeitig sichtbare Tiere sind umgesetzt; echte Laufbewegungen bleiben offen.
- Accessoire-Anker, Outfit-Layer, Speichern und Tier-spezifische Katalogregeln.

### Phase 4 · Spielen und Lernen als Rückkopplung

- Vor jedem Spiel freigeschaltetes Tier wählen; Figur/Animation nur kosmetisch verändern.
- Rewards als universelle Münzen; Rückkehr zur Alm mit sichtbarem Fortschritt.
- Lernkarten, Sounds, Spuren, Tieralphabet und Habitatwissen als kurze, ortsgebundene Momente.

### Phase 5 · Performance und Release-QA

- Mobile 390×844, Desktop 1024×900 und Zwischenbreiten testen.
- Häufige UI-PNGs preloaden, Szenen lazy laden, optional WebP/AVIF-Derivate messen; Master-PNG/JPGs behalten.
- Keyboard/Screenreader-Fokus, `prefers-reduced-motion`, Touch-Hitboxen und Offline-Rehydrierung prüfen.
- Build, Lint, Asset-Manifeste, fehlende Runtime-Pfade und visuelle Map-Kontinuität als Release-Gate.

## Abnahme für den ersten Integrationsschnitt

1. Neuer Nutzer startet und landet nach dem Onboarding direkt auf einer spielbaren Alm mit zwei Startertieren.
2. Almkarte zeigt alle freigeschalteten Tiere am gespeicherten Ort; Tiermarker sind zugänglich und öffnen die persönliche Tieransicht.
3. Ein Hotspot zoomt auf denselben visuellen Ort, blendet die passende Day/Evening/Night-Szene ein und führt mit Zurück wieder zur Karte.
4. Aus Tieransicht und aufgeklapptem Ortsdetail kann das ausgewählte Tier gefüttert, geknuddelt, gewaschen oder schlafen gelegt werden; die Basiskarte bleibt frei.
5. QR-/Code-Scan bleibt erreichbar, ohne die Alm visuell zu dominieren.
6. Die App bleibt bei fehlendem Tier, leerem Futterbestand, Nachtphase und reduzierter Bewegung benutzbar.

## Bewusst offene Entscheidungen

Die DOCX lässt Startertiere, Währungsname/Preise, MVP-Minispiele, Accessoire-Regeln, Eltern-Gate und die exakte V1-Habitatliste offen. Für die technische Integration verwende ich vorläufig Gigi + Beni als Starter, `coins` als neutralen internen Schlüssel und die vorhandenen vier Spiele; diese Defaults sind im Produktreview zu bestätigen, bevor Monetarisierung oder Content finalisiert wird.

## Umgesetzter Stand · 29. August 2026

- **Production-v1-Tiere:** 8 Arten × 3 Altersstufen sind unter `public/haalm/characters-v1/` als optimierte Runtime-PNGs eingebunden. Level 1–3 zeigt `young`, Level 4–7 `middle`, ab Level 8 `adult`. Der Übergang bei Level 4 und 8 besitzt eine Wachstumsfeier.
- **Zustandsbilder:** Neutral, glücklich, traurig, müde, krank und schlafend werden aus den neuen 256-px-Portraits beziehungsweise 128-px-Icons gewählt. Alle 24 Schlafsequenzen nutzen die acht vorhandenen Production-v1-Frames; Blick-links/-rechts verwendet die statischen Perspektiven.
- **Krankheit/Medizin:** Ein Tier wird nur bei niedrigem Hunger oder niedriger Sauberkeit und mindestens 48 Stunden ohne sinnvolle Pflege krank. Krankheit blockiert nur dieses Tier. Medizin kostet 6 Münzen, wird explizit gekauft, löst `recovering` aus und stellt freundliche Mindestwerte wieder her.
- **Ökonomie:** Futter kostet sichtbar 2 Münzen. Bei leerem Bestand wird niemals mehr automatisch beim Füttern ausgegeben; der Button wechselt zuerst ausdrücklich zu „Futter kaufen“. Zubehörpreise bleiben 7–14 Münzen, Medizin 6 Münzen. Spiele zahlen nur noch universelle Münzen (plus Herzen/XP), kein tiergebundenes Direktfutter.
- **Lernen:** Sechs ortsgebundene Lernkarten besitzen einmaligen, persistenten Fortschritt und je 2 Münzen Belohnung. Die fünf Lern-PNGs und das Coin-Burst-Feedback sind verdrahtet.
- **Freischaltung:** Neue Tiere starten als Jungtier im passenden `character.home`, erscheinen auf der Karte und erhalten ein einmaliges, persistentes Arrival-Overlay.
- **In-App-Tierkauf:** Noch nicht eingezogene Tiere werden im Shop als Jungtiere mit runden Icons angeboten und können für 24 Münzen einziehen; der QR-/Produktcode bleibt als gleichwertiger, dezenter Weg verfügbar. Die Preiszahl ist ein technischer Default aus der offenen DOCX-Entscheidung und vor Produktlaunch zu bestätigen.
- **Alm-UX-Nachschärfung:** Die Almkarte ist vollflächig ohne Titel-/Dashboard-Kopf. Pflege erscheint dort erst nach Tier- oder Bereichsauswahl. Ortsdetails starten als kleine, ausklappbare Bottom-Sheet-Zeile; bei bereits anwesenden Tieren gibt es keine sinnlose „Mit X besuchen“-Aktion, sondern direkt Pflege. Zurück setzt den Kartenmaßstab auch bei Browser-History-Navigation zurück.
- **Marker- und Detailvisualisierung:** Die Alm heißt in der Bottom-Navigation jetzt „Halm“ und steht an erster Stelle. Tiermarker verwenden getönte, halb offene Profilplaketten mit variierenden Zustands-Icons, sanfter Bewegung und bewusst überstehendem Kopf; Detail-Tieranker liegen je Lebensraum im Vordergrund beziehungsweise im Wasser. Die doppelte Hütte im Cozy-Cabin-Detail ist entfernt.
- **Elternbereich:** `/parent` ist auch beim Direktaufruf durch eine 60-Sekunden-Rechenaufgabe geschützt und bleibt nach Erfolg 10 Minuten offen. Kindersicherheit wird nur dort geändert. Echtgeld bleibt sichtbar deaktiviert, solange Payment-Backend und serverseitige Kaufprüfung fehlen.
- **Raster-Performance:** Alle 34 allgemeinen V2-PNGs bleiben als Master unter `redesign-raster/`; die App lädt kleinere Derivate aus `public/haalm/ui/runtime/` (zusammen ca. 4,3 MB statt ca. 38 MB). Die vier sichtbaren Navigationselemente bleiben als kompakte Runtime-Assets geladen, kleine Icons 96 px und Care-Elemente 192 px.
- **Nicht eingebunden:** `app_general_v1_rejected_svg` wird nicht verwendet. QA-Dateien, Chroma-Quellen, Rejects und leere Animationsordner sind keine Runtime-Assets.

Weiterhin echte externe beziehungsweise fehlende Asset-Blocker: Idle/Walk/Run und Pflege-/Spielreaktionen fehlen konsistent für 23 Tierpakete; Beni/Jungtier ist nur Pilot. Echtgeld benötigt Zahlungsanbieter, Receipt-Prüfung und Backend. Die im Produktionsbaum nur bei Beni vorhandenen Wake-Frames werden deshalb noch nicht als allgemeine Animation ausgegeben.
