# QD-Aptamer-Konjugate für die optische Biosensorik — Forschungspraktikum WS25

**Autor:** Ismail El Hayani (Master Nanotechnologie)  
**Betreuer / 1. Korrektur:** Ph.D. Rahimi  
**2. Korrektur:** Prof. Dr. Joseph  
**Datum:** 31.07.2025  
**Status:** 🟡 Zur Diskussion vorbereitet

---

## Zielsetzung (Quick Summary)

Entwicklung und Charakterisierung von **AgInS₂ (AIS)** und **AIS/ZnS Core-Shell** Quantenpunkt-Aptamer-Konjugaten als Plattform für optische Biosensoren.

- Konjugation über **EDC/NHS-Chemie** (Carbodiimid-Kupplung)
- Charakterisierung via UV-Vis, PL-Spektroskopie, FTIR, Fluoreszenzmikroskopie
- Fokus: optische Eigenschaften, kolloidale Stabilität, Nachweis der Oberflächenmodifikation

---

## 🧪 Wichtige Syntheseschritte (Durchführung)

### 1. AIS-QP Synthese
- **Reaktanden:** Ag, In, S-Vorläufer (MAA-Ligand, wässrig)
- **Methode:** Mikrowellen-assistierte Hydrothermalsynthese
- **Oberfläche:** Thiol (MAA = Mercaptoessigsäure) → Carboxyl-Gruppen nach außen

### 2. AIS/ZnS Core-Shell
- ZnS-Schale über Festlösung aufgetragen
- Schützt vor Oxidation, erhöht PLQY (~5-20% → 30-70%)
- Bessere kolloidale Stabilität

### 3. EDC/NHS Konjugation
- MAA-QDs (Carboxyl) → EDC-Aktivierung → NHS-Stabilisierung → NH₂-Aptamer (fluoreszenzmarkiert)
- **Erste Parameter:** Aptamer 2,5 µM, EDC/NHS Aktivierung je 15 s
- **Verbesserte Parameter:** Aptamer 5,0 µM, Aktivierung je 30 s, 2-stufige Ethanolfällung (3 mL + 2 mL), Ultraschall-Redispergierung 5 min (statt 3 min)

---

## 📊 Ergebnisse im Überblick

| Methode | AIS Core | AIS/ZnS Core-Shell | Interpretation |
|---------|----------|--------------------|----------------|
| **UV-Vis** | Hypsochrome Verschiebung, OD-Abfall | Ähnlich | Oberflächenmodifikation plausibel; OD-Abfall durch Materialverlust / Aggregation |
| **PL-Spektroskopie** | Intensitätsabfall, Aptamer-Emission (~520 nm), leichte Rotverschiebung | Stärkere Intensitätserhaltung, Peak bei 606 nm (vs. 592 nm unmodifiziert) | Koexistenz von QP und Aptamer; Core-Shell erheblich stabiler |
| **FTIR (ATR)** | Erhöhte Gesamtabsorption, C-H Peaks (2980, 2900 cm⁻¹), keine klaren Amid-I/II Banden | Analog | Aptamer-Anwesenheit wahrscheinlich; **kein eindeutiger Nachweis kovalenter Amidbindung** |
| **Fluoreszenzmikroskopie** | Veränderung der Verteilung, Farbverschiebung (orange-grün) | Lokale Cluster, gelb-grüne Bereiche, homogener | Hinweis auf Oberflächenmodifikation; Verdünnungseffekte nicht ausgeschlossen |

---

## 🔑 Kernargumente der Diskussion

### Positiv / Gelungen
- **AIS/ZnS Core-Shell ist deutlich überlegen:** Erhält mehr Photolumineszenz nach Konjugation → passivierende Wirkung der ZnS-Schale bestätigt (Mir et. al).
- **PL-Spektroskopie** zeigt Aptamer-Beitrag (~520 nm) und überlagertes QD-Signal → Probe enthält beide Komponenten.
- **Verbesserte Parameter (Kapitel 4.4)** zeigten messbare Verbesserung: höhere Aptamer-Konz., längere Aktivierung, schrittweise Ethanolfällung → bessere PL-Intensität bei AIS/ZnS.
- Konsistente Trends über **alle 4 Methoden** hinweg deuten auf tatsächliche Oberflächenmodifikation hin.

### Kritisch / Fraglich
- **Kein eindeutiger Nachweis kovalenter Konjugation:**
  - Amid-I (~1650 cm⁻¹) und Amid-II (~1540 cm⁻¹) im FTIR **fehlen** oder sind von Wasser überlagert.
  - Möglich: andere Wechselwirkungen (elektrostatisch, Adsorption, Quenching) dominieren.
  - Auch Aggregations-Quenching nicht ausgeschlossen.
- **EDC/NHS in wässrigem Medium ist problematisch:**
  - EDC-aktivierte NHS-Ester hydrolysieren schnell im Wasser → geringere Kopplungseffizienz (Thermo Fisher UG zitiert).
  - Rahimi kritisierte dies bereits; "rapid hydrolyzation of activated sites".
- **Referenzproben waren nicht prozess-identisch:**
  - Unmodifizierte QDs wurden nur verdünnt, nicht ethanolfällig/reinigungsprozessiert.
  - Größenabhängige Fraktionierung während Ethanolfällung → spektrale Verschiebungen möglicherweise artefaktbedingt.
- **Fluoreszenzmikroskopie nicht quantitativ:**
  - Staubpartikel, Verunreinigungen überstrahlen → keine verlässliche Zuordnung zu QD-Aptamer-Konjugaten.

### Zukunftsperspektiven
- Systematische Untersuchung des **molaren Verhältnisses QD : Aptamer**.
- Optimierung der **Aktivierung in wässrigem Medium** (ggf. mit Sulfo-NHS statt NHS, oder organische Lösungsmittelphase).
- **Sensitivere oberflächenanalytische Methoden:** TEM-EDX, XPS, Zeta-Potential / DLS für Nachweis.
- Integration in funktionales Sensorsystem: **Analytbindung, Nachweisgrenze, Selektivität** testen.
- Einsatz von **identisch behandelten Referenzproben** (Ethanolfällung ohne Aptamer) zur Kontrolle.

---

## 🗣️ Diskussionspunkte für das Gespräch (Rahimi / Prof. Joseph)

> Nutze diese als Sprungbrett für das Gespräch. Die Reihenfolge ist absichtlich so gewählt: erst Erfolge, dann offene Fragen.

1. **Core-Shell-Effekt:** AIS/ZnS zeigt konsistent höhere Stabilität. Wie weit kann die ZnS-Schalen-dicke optimiert werden, bevor Gitterverspannung neue Defekte erzeugt?

2. **Kovalenz vs. Assoziation:** Keine Amid-Banden in FTIR. Ist eine teilweise erfolgreiche Konjugation plus Adsorption/Quenching realistisch, oder sollten alternative Konjugationsrouten (Maleimid-Thiol, Biotin-Streptavidin) in Erwägung gezogen werden?

3. **EDC/NHS in Wasser:** Die Literatur (Thermo Fisher UG) sagt, NHS-Ester hydrolysieren schnell. Wie kann die Aktivierungseffizienz in wässrigem Medium gesteigert werden — Sulfo-NHS, geringere pH, höhere EDC-Konzentration, oder Wechsel zu organischem Medium?

4. **Referenzdesign:** Sollten wir unbedingt eine **identisch behandelte Referenz** (Ethanolfällung, Ultraschall, keine Aptamer-Zugabe) mitführen, um Artefakte von echten Konjugationseffekten zu trennen?

5. **Quantifizierung der Konjugation:** Gibt es hier im Haus Möglichkeiten für **DLS/Zeta-Potential, TEM oder XPS**, um die Oberflächenchemie zu verifizieren?

6. **FRET-Diskussion:** Die Arbeit erwägt FRET als Mechanismus, aber PL-Daten zeigen eher Quenching als effizienten Energietransfer. Sollte die FRET-Interpretation vorsichtiger formuliert oder ganz zurückgenommen werden?

7. **Aptamer-Selektivität:** Der Fokus liegt bisher auf der Konjugation. Wie geht es weiter mit dem **funktionalen Test** — konkreter Analyt (z.B. Acetamiprid, Thrombin, ein spezifisches Protein)?

8. **Schreibstil / Formulierungen:** Manche Passagen (Diskussion) wechseln zwischen Deutsch und Englisch (z.B. "Discussion" in der .docx ist auf Englisch). Soll die finale Fassung einheitlich Deutsch sein?

9. **Reproduzierbarkeit:** Die "verbesserten Parameter" wurden nur einmal getestet. Sollte eine Replikation mit statistischer Bewertung gefordert werden?

10. **Nächste Schritte:** Nach Abschluss des Forschungspraktikums — wie geht das Projekt weiter? Masterarbeit? Publikation?

---

## 📎 Verknüpfte Inhalte

- [[Literaturen je nach Ziel]]
- [[EDC/NHS Conjugation Protokoll]]
- [[Synthesis of AgInS2 QDs]]
- [[UV-Vis Charakterisierung]]
- [[PL-Spektroskopie Ergebnisse]]
- [[FTIR Banden Interpretation]]

---

## 🔖 Notizen (freier Bereich)

<!-- Nutze diesen Bereich während des Gesprächs -->

- [ ] Besprochen: Core-Shell-Schalen-Dicke
- [ ] Besprochen: Kovalenznachweis / FTIR
- [ ] Besprochen: EDC/NHS Wasser-Hydrolyse
- [ ] Besprochen: Referenzdesign
- [ ] Besprochen: Nächste analytische Methoden
- [ ] Besprochen: FRET-Interpretation
- [ ] Besprochen: Funktionaltest / Analyt
- [ ] Besprochen: Sprache / Formulierungen
- [ ] Besprochen: Reproduzierbarkeit / Replikation
- [ ] Besprochen: Zukunft des Projekts

---

*Erstellt aus: Forschungspraktikum Qd-Aptamer-Konjugate für die optische Biosensorik 2.docx / .pdf (31.07.2025) + discussion.docx*  
*Ziel: Vorbereitung auf das Gespräch mit Rahimi / Prof. Joseph*
