# Marvel Katalog DE für Stremio

Ein schlankes Stremio-Katalog-Add-on mit genau drei Reihen:

- **Marvel: Serien** – Marvel-Realserien
- **Marvel: Filme** – Marvel-Filme in Veröffentlichungsreihenfolge
- **MCU: Filme chronologisch** – MCU-Kinofilme nach der offiziellen Handlungschronologie; noch nicht offiziell platzierte Zukunftsfilme und TV-Specials sind ausgenommen

Das Add-on stellt **keine Streams** bereit. Alle Einträge verwenden IMDb-IDs, damit installierte Metadaten- und Wiedergabe-Add-ons sie auflösen können.

## Lokal starten

Voraussetzung: Node.js 20 oder neuer.

```bash
npm start
```

Danach im Browser `http://localhost:7000` öffnen und auf **In Stremio installieren** klicken. Alternativ kann diese Manifest-Adresse in Stremio eingefügt werden:

```text
http://localhost:7000/manifest.json
```

Hinweis: Ein lokal laufendes Add-on ist nur erreichbar, solange der Rechner und der Prozess laufen. Für die dauerhafte Nutzung muss der Ordner bei einem Node.js-Host mit HTTPS veröffentlicht werden. Der Startbefehl ist `npm start`; der Host muss die Umgebungsvariable `PORT` setzen dürfen.

## Testen

```bash
npm test
```

## Endpunkte

- `/manifest.json` – Stremio-Manifest
- `/catalog/series/marvel-series.json` – Serien
- `/catalog/movie/marvel-movies.json` – Filme
- `/catalog/movie/mcu-chronological.json` – chronologische MCU-Filme
- `/health` – Status und Anzahl der Einträge

## Herkunft der Katalogdaten

Die kuratierten Titellisten, Metadaten und Bilddateien basieren auf dem Projekt [joaogonp/addon-marvel](https://github.com/joaogonp/addon-marvel), Copyright © 2025 joaogonp. Die ursprünglichen Lizenzbedingungen stehen in `LICENSE`. Server, Routing, Typzuordnung, Installationsseite und Tests wurden für diese Variante neu aufgebaut.

Marvel, die Charakternamen und zugehörige Marken gehören ihren jeweiligen Rechteinhabern. Dieses Fanprojekt ist nicht mit Marvel Entertainment oder Disney verbunden.
