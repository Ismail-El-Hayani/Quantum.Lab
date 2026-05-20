# 🚨 Vollständige Korrektur- und Verbesserungsliste — QD-Aptamer Forschungspraktikum

> **Autor:** Ismail El Hayani  
> **Datei:** Qd-Aptamer-Konjugate für die optische Biosensorik 2.docx / .pdf  
> **Status:** 🟠 MASSIVE revisions needed before submission  
> Letzte Aktualisierung: 2025-05-20

---

## 1. KRITISCHE FEHLER (Müssen sofort korrigiert werden)

### 1.1 Abschnittsnummerierung kaputt — Zirkelbezug!
- **Problem:** Im Text steht bei "Verbesserte Versuchsparameter":  
  *"Die in Abschnitt 4.4 beschriebene Konjugation..."* — **ABER** der Abschnitt "Verbesserte Versuchsparameter" **ist selbst 4.4** im Inhaltsverzeichnis!
- **Das heißt:** Der Abschnitt referenziert sich selbst. Das ist ein **fataler logischer Fehler**.
- **Lösung:** 
  - Entweder: EDC/NHS-Konjugation = **4.3**, Verbesserte Parameter = **4.4** (dann muss der Satz in 4.4 heißen: *"Die in Abschnitt 4.3 beschriebene Konjugation..."*)
  - ODER: EDC/NHS-Konjugation = **4.3**, Verbesserte Parameter = **4.3.1** (Unterabschnitt)

### 1.2 Doppelte Nummerierung in Grundlagen
- **Problem:** Im Inhaltsverzeichnis steht zweimal **3.3.1**:
  - 3.3.1 Fluoreszenzbasierte Verfahren
  - 3.3.1 Elektrochemilumineszenz (ECL)  
  **→ ECL muss 3.3.2 sein!**
- **Auch:** 3.1.2 heißt "AIS-QP", 3.1.3 heißt "AIS/ZnS-QP" — aber in 3.1.2 steht "3.1.2 AIS/ZnS-QP" im Textkörper!  
  **→ Die Überschriften im Textkörper stimmen nicht mit dem Inhaltsverzeichnis überein.**

### 1.3 Sprachwechsel innerhalb derselben Arbeit (DE ↔ EN)
- Die Datei `discussion.docx` ist **vollständig auf Englisch**, während der Haupttext **Deutsch** ist.
- Die finale Arbeit muss **EINHEITLICH** sein — entweder alles Deutsch oder alles Englisch.
- **Empfehlung:** Deutsch beibehalten, aber die "Discussion"-Section muss professionell ins Deutsche übersetzt werden. Oder: Absprache mit Prof. Joseph, ob Englisch erwünscht ist.

### 1.4 Fehlende Werte in Gleichung (1)
- **Problem:** Im Text steht: "(1)" ohne eingegebene Formel. Im PDF ist die Gleichung wahrscheinlich ein Bildobjekt, aber im Textkörper ist sie leer.
- **Was fehlt:** Die Brus-Gleichung ist zitiert, aber im DOCX-Text steht nur "(1)".
- **Lösung:** Formel explizit als LaTeX-ähnlichen Text einfügen oder als eingebettetes equation-Objekt:
  ```
  Eg = Ebulk + ℏ²π²/(2μr²) – 1.8e²/(εr)
  ```

---

## 2. INHALTLICHE / WISSENSCHAFTLICHE FEHLER

### 2.1 Quanten Confinement — Größenbereich fehlt
- **Text:** "Quantum Punkten (QP) sind Halbleiter-Nanokristalle mit Durchmessern im Bereich von , deren einzigartige..."
- **Problem:** Nach "im Bereich von" fehlt die Zahl! Sollte z.B. "1–10 nm" sein.
- **Korrektur:** *"...mit Durchmessern im Bereich von 1–10 nm, deren..."*

### 2.2 Brus-Modell — Parameter nicht definiert
- **Text:** "Dabei Eg bezeichnet die Bandlücke..." — **fehlende Symbole** in der Textbeschreibung.
- Die Variablen `r`, `m_e`, `m_h`, `ε` sind zwar in der Tabelle aufgeführt, aber im Fließtext nicht mit ihren Symbolen verknüpft. Das ist verwirrend.
- **Korrektur:** Satz sollte lauten: *"Dabei bezeichnet Eg die Bandlücke des Volumenmaterials, r den Radius der QP, m_e* und m_h* die effektiven Massen von Elektron und Loch, sowie ε_r die Dielektrizitätskonstante."*

### 2.3 "Defektzustände innerhalb der Bandlücke" — physikalisch fragwirdig
- **Problem:** Defektzustände liegen **innerhalb der Bandlücke**, nicht "in der Bandlücke". Das ist korrekt ausgedrückt, aber:  
  Die Formulierung "Emission wird maßgeblich durch Defektzustände innerhalb der Bandlücke beeinflusst" könnte als "Band-to-defect statt Band-to-band" missverstanden werden.
- **Besser:** *"Die Photolumineszenz von AIS-QP wird hauptsächlich durch Rekombination über Donator-Akzeptor-Paare verursacht, die Energieniveaus innerhalb der Bandlücke besetzen."*

### 2.4 "Quantum Punkten" → "Quantenpunkte"
- "Quantum Punkten" ist ein Anglizismus-Fehler. Im Deutschen heißt es durchgehend **"Quantenpunkte"** oder **"QP"**, nicht "Quantum Punkten".
- Dieser Fehler wiederholt sich im gesamten Text.

### 2.5 "Fälschung" statt "Fällung"
- Im Dateipfad: `Ethanol_Fällung` — korrekt.
- Aber im Text: *"ethanolbasierte Reinigungs- und Fällungsschritte"* — auch korrekt.
- **Dennoch prüfen:** Gibt es irgendwo "Ethanolfälschung" als Tippfehler?

### 2.6 FRET-Kapitel — physikalisch zu optimistisch
- **Problem:** Im Text wird FRET als möglicher Mechanismus erwähnt, aber die PL-Daten zeigen fast ausschließlich **Quenching**.
- **Diskussion sagt korrekt:** "FRET lässt sich nicht belegen". **ABER** in der Einleitung/Grundlagen wird FRET noch als funktionierendes Prinzip dargestellt (Kap. 3.3.1, Abb. 4).
- **Empfehlung:** In der Einleitung bereits einschränken, dass FRET nur unter sehr spezifischen Abstands- und Orientierungsbedingungen auftritt.

### 2.7 Thermo Fisher Zitat — Quellenangabe unvollständig
- **Text:** "(Thermo Fisher Scientific. (2011). NHS and Sulfo-NHS...)"
- **Problem:** Der Verweis ist ein Hersteller-Handbuch, kein Peer-Review-Artikel. Für eine Masterarbeit ist das akzeptabel, aber: Es ist das **einzige nicht-wissenschaftliche Zitat**.
- **Alternative:** Suche nach einer peer-reviewed Publikation zu EDC/NHS-Hydrolyse (z.B. Grabarek & Gergely, 1990, Anal. Biochem.).

### 2.8 Tabelle der Symbole — Einheiten fehlen oder falsch
- **Tabelle 1:** Viele Einheiten sind leer oder unvollständig:
  - "Absorption" → keine Einheit (sollte z.B. a.u. oder OD)
  - "Intensität des übertragenen/einfallenden Lichts" → keine Einheit (W/m², a.u.)
  - "Alpha - verwendet für spektrale Eigenschaften" → Einheit fehlt (z.B. cm⁻¹)
  - "Beta - verwendet im Kontext von Energie oder Übergangswahrscheinlichkeit" → Einheit fehlt
- **Problem:** Diese Symboletabelle erfüllt ihren Zweck nicht, wenn Einheiten fehlen.

### 2.9 "ca. – unterschiedliche Sequenzen"
- **Problem:** SELEX-Bibliothek wird als "ca. – unterschiedliche Sequenzen" beschrieben. Die tatsächliche Größe fehlt (typisch: 10¹⁴–10¹⁵ Sequenzen).
- **Korrektur:** *"ca. 10¹⁴ bis 10¹⁵ unterschiedliche Sequenzen"*.

### 2.10 "Tuerk &Gold 1990" — fehlendes Leerzeichen
- **Im Text:** "Tuerk &Gold 1990" → sollte "Tuerk & Gold 1990" heißen.
- **Im Literaturverzeichnis:** "Tuerk, C. & Gold, L." — korrekt formatiert. Der Fehler ist nur im Fließtext.

### 2.11 "Dhamo et al,. 2022" — Interpunktionsfehler
- **Im Text:** "(Dhamo et al,. 2022)" — **Komma vor Punkt!**
- **Korrektur:** "(Dhamo et al., 2022)"
- **Auch:** "(Gromova et al., 2019)" im Text hat ein Leerzeichen nach "Abb.1" → "Abb.1" sollte "Abb. 1" sein (geschütztes Leerzeichen).

### 2.12 "Abbildung  1" / "Abbildung  2" — Doppelte Leerzeichen
- Überall im Text: "Abbildung  1", "Abbildung  2", "Abbildung  18" usw. mit **zwei Leerzeichen** statt einem.
- **Korrektur:** Suchen & Ersetzen: "Abbildung  " → "Abbildung " (oder noch besser: "Abb.\u00A0" mit geschütztem Leerzeichen).

### 2.13 "(Banyay et al., 2003)." — überflüssiger Punkt vor Quellenangabe
- **Im Text:** "...formuliert werden (Banyay et al., 2003)."  
  Der Punkt nach der Klammer ist korrekt im Deutschen, ABER: in manchen Stellen steht der Punkt **innerhalb** der Klammer: "...(Banyay et al., 2003)." vs "...(Banyay et al., 2003)." — beides ist gleich? Nein, manchmal steht er falsch.
- **Konsistenz prüfen:** Nach Zitaten sollte entweder immer "(Autor, Jahr)." oder "(Autor, Jahr.)" stehen — nicht beides.

### 2.14 Literaturverzeichnis — Formatierung inkonsistent
- Einige Einträge haben **DOI**, andere nicht.
- Einige sind kursiv (Titel), andere nicht.
- "Mir et al." im Lit.-Verzeichnis ist als "Mir, I. A.; Bhat, M. A.; ..." formatiert — korrekt. Aber im Fließtext steht manchmal nur "Mir et al., 2019" und manchmal "Mir et. al.", was falsch ist ("et al.", nicht "et. al.", und nur bei 3+ Autoren).

### 2.15 "die Maßstaben sind in (100 µm)" — Grammatikfehler
- **Text in Abbildungsunterschriften:** "die Maßstaben sind in (100 µm)"
- **Bedeutung unklar:** Soll das heißen: "Maßstab: 100 µm"? Oder "Aufnahme im Maßstab von 100 µm"?
- **Korrektur:** *"Maßstab: 100 µm"* oder *"Balken = 100 µm"*

### 2.16 "ZF" am Ende der Discussion.docx
- In der Datei `discussion.docx` steht am Ende einfach "ZF".
- **Was ist ZF??** Vermutlich ein Arbeits-Initial oder ein Versehen. Muss gelöscht werden.

---

## 3. SPRACHLICHE FEHLER UND FORMULIERUNGSSCHWÄCHEN

### 3.1 "Einleitung " — Leerzeichen am Ende der Überschrift
- Mehrere Überschriften haben ein **hängendes Leerzeichen**: "Einleitung ", "Grundlagen ", "Diskussion "
- **Korrektur:** Alle Überschriften auf Leerzeichen am Ende prüfen.

### 3.2 "Quantum Confinement-Effekt" — Bindestrich oder Gedankenstrich?
- **Im Inhaltsverzeichnis:** "Quantum Confinement-Effekt" (Bindestrich)
- **Besser:** "Quantum-Confinement-Effekt" mit Bindestrich zwischen beidem, oder besser auf Deutsch: **"Effekt der quantenmechanischen Ladungsträgerconfinement"** oder einfach **"Quantenconfinement-Effekt"**.
- Aber: Da die Arbeit auf Deutsch ist, sollte der Begriff **"Quantenconfinement"** oder **"Quantenconfinement-Effekt"** verwendet werden.

### 3.3 "einzelsträngige Nukleinsäurefragmente"
- **Problem:** Einzelsträngig sollte zusammengeschrieben werden? Nein, "einzelsträngig" ist korrekt.
- **Aber:** "Nukleinsäurefragmente" sollte "Nukleinsäure-Fragmente" oder "Nukleinsäurefragmente" (Duden: zusammen) — ist korrekt.

### 3.4 "hochsensitiven" vs. "hochsensitiver"
- **Text:** "...Nachweissystemen in Diagnostik..." → "Nachweissysteme" (Plural).
- "hochsensitiven" stimmt mit Genitiv/Dativ nicht — prüfen: "robusten, hochsensitiven und zugleich ungiftigen Nachweissystemen" → **Dativ Plural, korrekt!** (der robuste → den robusten). OK.

### 3.5 "ungiftige Schwermetalle" → Logikfehler!
- **Text:** "...ungiftigen Nachweissystemen..." und "...ohne giftige Schwermetalle..."
- **Problem:** "ungiftige Schwermetalle" ergibt keinen Sinn — Schwermetalle (Cd, Pb, Hg) sind **giftig**. Gemeint ist: "ohne giftige Schwermetalle wie Cadmium".
- **Aber:** "ungiftige" bezieht sich auf die Nachweissysteme, nicht auf die Metalle. Satzbau ist grammatikalisch richtig, aber missverständlich.
- **Besser:** *"...Nachweissystemen, die frei von giftigen Schwermetallen wie Cadmium sind, ..."*

### 3.6 "das Aufbringen einer Schale" → "das Aufbringen einer Schale" 
- Grammatikalisch korrekt. Aber "Aufbringen" ist ungewöhnlich für Nanopartikel.
- **Besser:** *"das Wachsen einer Schale"*, *"das epitaktische Abscheiden einer Schale"* oder *"die Schalenüberwachsung"*.

### 3.7 "einer Schale aus einem Halbleiter mit größerer Bandlücke"
- **Wissenschaftlich korrekt:** ZnS hat größere Bandlücke (~3.6 eV) als AIS (~1.7–2.0 eV).
- Aber im Satz steht nicht, **welche** Bandlücke AIS hat! Das ist eine wichtige Information.
- **Korrektur:** *"...aus ZnS (Bandlücke ~3,6 eV, größer als die von AIS ~1,8 eV)..."*

### 3.8 "thiol-stabilisierten" → "thiolstabilisierten"
- Im Deutschen zusammen: "thiolstabilisiert" (auch wenn "Thiol" als Nomen eigentlich getrennt wäre, bei Partizipialkonstruktionen zusammen).
- **Alternative:** "mit Thiolen stabilisierten".

### 3.9 "Stokes-Verschiebung, also die Differenz..."
- Hier steht eine Definition. **Gut!** Aber: Die Einheit wird als "nm" angegeben — manchmal ist Stokes-Verschiebung auch in Energie (eV). Da hier nm verwendet wird, ist das OK, aber es sollte konsistent bleiben.

### 3.10 "Table 1" vs. "Tabelle 1" vs. "Tabelle 2"
- **In der Arbeit:** Mischung von "Table" und "Tabelle"!
  - "Tabelle 1" für Symbole
  - "Tabelle 2" für Abkürzungen
  - "Table 1" für Aptamer-vs-Antikörper-Vergleich
- **Regel:** Auf Deutsch = "Tabelle". Alles auf "Tabelle" umstellen.

### 3.11 "Vorteile von Aptameren gegenüber Antikörpern"
- Die Überschrift "Table 1: Vorteile von Aptameren..." verwendet "Table" statt "Tabelle". Außerdem fehlt die Kapitelnummer.
- **Besser:** *"Tabelle 3: Vergleich der Eigenschaften von Aptameren und Antikörpern (angepasst nach Wen et al., 2017; Song et al., 2008)."*

### 3.12 "Kupplung" vs. "Kopplung"
- Im Text wird **beides** verwendet:
  - "Carbodiimid-Kupplung" (Kapitel 3.4)
  - "EDC/NHS-Kopplung" (Abbildungsunterschriften)
- **Konsistenz:** Wähle entweder "Kupplung" (chemisch: Kupplungsreaktion) oder "Kopplung" (allgemein: Ankopplung).
- **Empfehlung:** In der Chemie ist "Kupplung" (Coupling) der Fachbegriff. Im Biosensor-Kontext sagt man oft "Biokonjugation".  
  **Einheitlich:** "Biokonjugation" für den Prozess, "Kupplung" für die chemische Reaktion selbst.

### 3.13 "Click"-Chemie mit Anführungszeichen
- **Text:** `Bioorthogonale "Click"-` — Satz wird mitten abgebrochen! Der Rest fehlt.
- **Wo:** Nach "Click"- in Kapitel 3.4 ist der Satz unvollständig.
- **Muss vervollständigt werden**, z.B.: *"Bioorthogonale Click-Reaktionen (z.B. CuAAC, SPAAC) ermöglichen hochselektive Konjugationen unter milden Bedingungen."*

### 3.14 "zwei aufeinanderfolgenden Ethanolfällungsschritten (3 mL gefolgt von 2 mL Ethanol)"
- **Syntaxfehler:** "in zwei aufeinanderfolgenden Ethanolfällungsschritten (3 mL gefolgt von 2 mL Ethanol)" — unklar, ob die gesamte Ethanol-Menge gemeint ist.
- **Besser:** *"in zwei aufeinanderfolgenden Ethanolfällungsschritten (zunächst 3 mL Ethanol, anschließend weitere 2 mL Ethanol)"*

### 3.15 "der zuletzte Konjugationseinstellung"
- **Fehler:** "zuletzte" → "zuletzt" oder "letzte"
- **Ganzer Satz:** "...dass die Verbesserung der zuletzte Konjugationseinstellung erfolgreich war."
- **Korrektur:** *"...dass die Verbesserung der zuletzt gewählten Konjugationsparameter erfolgreich war."* oder *"...dass die zuletzt eingestellten Konjugationsparameter erfolgreich waren."*

### 3.16 "in ATR-Messungen"
- **Text:** "Der Spektralbereich zwischen 1600 und 1650 cm⁻¹ ist in ATR-Messungen häufig schwer eindeutig zu interpretieren..."
- **Grammatik:** "schwer eindeutig zu interpretieren" ist umgangssprachlich.
- **Besser:** *"...ist in ATR-Messungen häufig schwer eindeutig zu interpretieren"* → *"...lässt sich in ATR-Messungen häufig nicht eindeutig interpretieren"*.

### 3.17 "die Maßstäbe sind in (100 µm)"
- Wiederholt sich in **mehreren** Abbildungsunterschriften (Abb. 19, 20, 24, 25).
- **Korrektur:** "Maßstab: 100 µm" (überall gleich).

### 3.18 "ausgeprägte Bildung von hellen, lokalisierten Fluoreszenzclustern"
- **Rechtschreibung:** "Fluoreszenzclustern" → "Fluoreszenz-Clustern" oder "fluoreszierenden Clustern".

### 3.19 "die Präsenz von organischen Verbindungen"
- "Präsenz" ist ein Anglizismus. Besser: **"Anwesenheit"** oder **"Vorhandensein"**.

### 3.20 "kein vollständiger Ersatz der QD-Fluoreszenz durch eine Aptamer-Emission vorliegt"
- "Aptamer-Emission" ist irreführend — das Aptamer emittiert nicht, es ist der **Fluorophor** am Aptamer, der emittiert.
- **Korrektur:** *"...durch eine Fluorophor-Emission des markierten Aptamers vorliegt."*

---

## 4. FORMALE FEHLER (Layout, Formatierung, Zahlen)

### 4.1 Fehlende Kapitelnummer bei Abbildungsunterschriften
- Manche Abbildungen sind nummeriert, aber nicht konsistent referenziert (z.B. "Abb. 11" wird im Text erwähnt, ist aber nirgends im extrahierten Text sichtbar — könnte fehlen).
- **Prüfe:** Sind alle Abbildungen, die im Text zitiert werden (Abb. 1–25), auch tatsächlich im Dokument enthalten?

### 4.2 Seitenzahlen im Inhaltsverzeichnis
- Das Inhaltsverzeichnis zeigt Seitenzahlen an (z.B. "Zielsetzung 4", "Einleitung 4").
- **Aber:** Die Seitenzahlen im TOC stehen direkt am Wort, ohne Leerzeichen oder mit zu vielen Punkten. Das ist typisch für automatische Verzeichnisse, die noch nicht aktualisiert wurden.
- **Aktion:** In Word: Rechtsklick im TOC → "Verzeichnis aktualisieren" → "Gesamtes Verzeichnis aktualisieren".

### 4.3 Durchschuss (Zeilenabstand) und Schriftart
- Da diese Informationen im DOCX-Format liegen, kann ich sie nicht sehen.
- **Empfehlung:** Prüfe die Vorlage von der Uni/Institut. Typisch: Times New Roman 12 pt, 1,5-facher Zeilenabstand, Blocksatz.

### 4.4 Dateinamen — Leerzeichen und Umlaute
- `"Qd-Aptamer-Konjugate für die optische Biosensorik 2.docx"` enthält Leerzeichen und Umlaute.
- **Nicht tragisch**, aber bei Einreichung manchmal problematisch.

---

## 5. WISSENSCHAFTLICHE SCHWÄCHEN UND INHALTLICHE LÜCKEN

### 5.1 Keine statistische Bewertung
- Alle Experimente scheinen als **Einzelmessung** dargestellt.
- **Fehlt:** Fehlerbalken, Standardabweichung, Konfidenzintervalle, t-Tests.
- **Minimalanforderung:** Wiederholungsmessungen (n≥3) mit Mittelwert ± Standardabweichung.

### 5.2 Keine Quantifizierung der Konjugationseffiizienz
- **Fehlt:** Wie viel Aptamer wurde tatsächlich gebunden? 
- **Mögliche Methoden:**
  - UV-Vis Quantifizierung über den Aptamer-Extinktionskoeffizienten
  - Fluoreszenz-Kalibration der freien Aptamer-Lösung
  - Bradford/BCA für Protein-Aptamer, aber hier DNA → **Oligonukleotid-Quantifizierung** nötig

### 5.3 Keine DLS- oder Zeta-Potential-Daten
- Die Oberflächenladung (Zeta-Potential) wäre ein **kritischer Nachweis** für die erfolgreiche Konjugation:
  - Vor Konjugation: negativ (COO⁻)
  - Nach Konjugation: weniger negativ oder positiver (NH₃⁺ des Aptamers)
- **Fehlt vollständig.** Wurden diese Messungen gemacht? Falls ja, einbauen. Falls nein, erwähnen, warum.

### 5.4 Reinigung — unvollständig beschrieben
- Die Ethanolfällung wird erwähnt, aber keine Details zu:
  - Drehzahl und Zeit der Zentrifugation
  - Temperatur
  - Wie oft wurde gewaschen?
  - Was wurde als Supernatant verworfen?

### 5.5 "Materialverluste" als Erklärung, aber nicht quantifiziert
- Immer wieder: "Materialverluste während der Reinigung".
- **Aber:** Wie viel? 20%? 50%? 80%? Ein Quantifizierung wäre über UV-Vis-Konzentrationsbestimmung möglich.

### 5.6 "Staubpartikel" als Erklärung für grüne Flecken
- In der Diskussion: "Staubpartikel, die im Fluoreszenzmikroskop häufig stark überstrahlen."
- **Kritisch:** Das deutet auf **unsaubere Probenvorbereitung** hin.
- **Empfehlung:** Erwähnen, dass probenvorbereitende Maßnahmen (Filtration, Tuchsaubereitung) in zukünftigen Experimenten verbessert werden müssen.

### 5.7 Keine Konzentrationsangaben in PL-Vergleichen
- Abb. 22, 23, 24, 25 zeigen PL vor und nach Konjugation.
- **Aber:** Sind die Konzentrationen identisch? Wurden die Spektren auf gleiche QD-Konzentration normiert?
- **Wenn nicht:** Intensitätsvergleiche sind **wertlos**. Das muss explizit erwähnt werden.

### 5.8 Die Formulierung "nicht eindeutig" erscheint zu oft
- Die Diskussion wiederholt: "nicht eindeutig", "nicht zweifelsfrei", "nicht beweisend".
- **Wahrehrnehmung:** Das macht die Arbeit **schwach**. Es ist besser, ehrlich zu sein, aber die Formulierung sollte differenzierter sein:
  - Statt "nicht eindeutig" → "eingeschränkt aussagekräftig" oder "erfordert ergänzende Methoden"
  - Statt "kein Nachweis" → "kein direkter Nachweis, aber plausibel im Kontext"

### 5.9 "Teilweise erfolgreiche Konjugation"
- Das ist der Kernbefund. Aber: Was genau ist "teilweise erfolgreich"?
- **Fehlt eine Messgröße** für "Erfolg". Definiere "Erfolg": z.B. "Nachweis einer Amidbindung im FTIR" oder "Vorhandensein von Aptamer-PL bei gleichzeitiger QD-PL".
- Ohne eine klare **Erfolgsmetrik** bleibt die Aussage subjektiv.

### 5.10 Vergleich mit Literatur — zu oberflächlich
- Die Literaturzitate sind hauptsächlich **zur Erklärung von Grundlagen**.
- **Fehlt:** Vergleich der eigenen Ergebnisse mit **direkten** Literaturdaten. Z.B.:
  - Wie ist die PL-Verschiebung bei anderen AIS-Aptamer-Systemen?
  - Welche Kopplungseffizienzen wurden von Wen et al. (2017) erreicht?

### 5.11 "Eidesstattliche Erklärung" — Standardtext, aber prüfen
- **Text:** "...ohne die Inanspruchnahme anderer als der angegebenen Hilfsmittel..."
- **Aber:** Im Hinweis am Ende steht: "Zur sprachlichen Überarbeitung... wurden KI-basierte Werkzeuge (ChatGPT, OpenAI; DeepL Translator) verwendet."
- **Kritisch:** In manchen Universitäten muss KI-Nutzung in der Eidesstattlichen Erklärung **explizit** erwähnt werden. Bitte die Prüfungsordnung prüfen! Manche Unis verlangen: "Ich habe KI-Tools zur sprachlichen Korrektur verwendet." in der Eidesstattlichen Erklärung.

---

## 6. EMPFEHLUNGEN FÜR DIE NÄCHSTEN SCHRITTE (Prioritäten)

### 🔴 BLOCKER (Müssen vor Abgabe erledigt werden)
1. **Abschnittsnummerierung fixieren** (Zirkelbezug 4.4 ↔ 4.4)
2. **Sprache einheitlich** (alles Deutsch ODER alles Englisch)
3. **Fehlende Werte ergänzen:** QD-Größe (Kap. 3.1), Brus-Gleichung im Text
4. **Gleichung (1) tatsächlich einfügen**
5. **"Quantum Punkten" → "Quantenpunkte"** (global suchen & ersetzen)
6. **Abbildungsnummerierungen prüfen** — alle Abb. X im Text auch vorhanden?
7. **"ZF" aus discussion.docx entfernen**
8. **Eidesstattliche Erklärung auf KI-Hinweis prüfen**

### 🟠 SEHR WICHTIG (Würde die Note deutlich verbessern)
9. **"Table" → "Tabelle"** global umstellen
10. **Literaturverzeichnis formatieren** (einheitlich DOI, einheitliche Formatierung)
11. **Doppelte Leerzeichen** nach "Abbildung" entfernen
12. **Interpunktionsfehler** bei Zitaten (et al. → et al.,) korrigieren
13. **"kein Nachweis" → differenziertere Formulierungen**
14. **Tabelle der Symbole vervollständigen** (Einheiten!)

### 🟡 EMPFEHLENSWERT (Würde Professionalität erhöhen)
15. Erwähnung von **DLS/Zeta-Potential** als fehlende Methode (entweder ergänzen oder als Limitation diskutieren)
16. **Konjugationseffizienz** zumindest semi-quantitativ abschätzen (aus UV-Vis OD vor/nach)
17. **Referenzproben** — identische Behandlung ohne Aptamer erwähnen
18. **Alternative Konjugationsrouten** (Maleimid-Thiol, Biotin-Streptavidin) kurz als Perspektive nennen
19. KI-Hinweis **an prominenter Stelle** platzieren (nicht nur am Ende)

---

*Erstellt durch systematischen Review des DOCX-Textes.*
