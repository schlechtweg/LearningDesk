# TODO

## Offen

- [ ] **GitHub Action für den Build einrichten**
  - Bei jedem Push auf den Standard-Branch automatisch `python3 src/build.py --pdf` ausführen (Python mit Jinja2, Node.js mit Playwright/Chromium für die Factsheet-PDFs).
  - Ergebnis in `docs/` veröffentlichen: entweder die erzeugten Dateien zurück committen oder direkt über „GitHub Actions“ als Pages-Quelle deployen. Dann müsste `docs/` nicht mehr im Repository liegen.
  - Prüfen, ob der Build fehlschlägt, wenn ein Factsheet nicht auf eine Seite passt (`render-pdf.js` setzt dann einen Fehlercode).
  - README-Abschnitt „Bauen“ anpassen.
