# Marvel Katalog DE für Stremio

Ein schlankes Stremio-Katalog-Add-on mit genau drei Reihen:

- **Marvel: Serien** – Marvel-Realserien
- **Marvel: Filme** – Marvel-Filme in Veröffentlichungsreihenfolge
- **MCU: Filme chronologisch** – MCU-Kinofilme nach Marvels offizieller Disney+-Timeline; noch nicht offiziell platzierte Zukunftsfilme und TV-Specials sind ausgenommen

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

## Grundlage der chronologischen Reihenfolge

Die Filmfolge wird aus Marvels offizieller **MCU Complete Timeline** abgeleitet, wobei Serien, Staffeln, One-Shots und TV-Specials herausgefiltert werden. `Spider-Man: No Way Home` fehlt in manchen Disney+-Listen aus Vertriebsgründen; er wird zwischen `Eternals` und `Doctor Strange in the Multiverse of Madness` ergänzt. Marvel bestätigt ausdrücklich, dass `No Way Home` vor `Multiverse of Madness` spielt.

`The Fantastic Four: First Steps` spielt intern in einem alternativen, retrofuturistischen Universum. Er steht dennoch am Ende des Katalogs, weil Marvel/Disney+ ihn dort in der übergreifenden MCU-Ansehreihenfolge platziert. Der Katalog ist daher eine **chronologische Ansehreihenfolge**, keine gemeinsame Kalenderachse über alle Paralleluniversen.

Quellen:

- [Marvel: See the Complete MCU Timeline on Disney+](https://www.marvel.com/articles/movies/mcu-timeline-order-disney-plus)
- [Marvel: Kevin Feige Connects Multiverse of Madness to Loki & No Way Home](https://www.marvel.com/articles/movies/doctor-strange-in-the-multiverse-of-madness-loki-spider-man-no-way-home-kevin-feige-connects)
