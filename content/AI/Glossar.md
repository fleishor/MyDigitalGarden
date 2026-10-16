---
showOnIndexPage: true
draft: true
date: 2026-04-13
title: Glossar
image: AI.png
description: Eine Übersicht über AI Begriffe
tags:
  - AI
---
## Large Language Model (LLM)


## Vektordatenbank


## Retrieval-Augmented Generation (RAG)

Die Idee: Eine KI beantwortet eine Frage nicht nur aus dem Wissen, das sie beim Training gelernt hat. Sie sucht zuerst in passenden Dokumenten oder Daten nach Informationen und verwendet diese dann für ihre Antwort.

RAG wird oft mit **Embeddings** und einer **Vektordatenbank** umgesetzt: Embeddings stellen Texte als Zahlen dar, sodass das System auch inhaltlich ähnliche Passagen findet, selbst wenn sie andere Wörter verwenden.

**Abgrenzung zum Fine-Tuning:** RAG ergänzt die Antwort bei jeder Anfrage um gefundene Informationen. Fine-Tuning verändert dagegen das Modellverhalten durch weiteres Training. Für häufig wechselnde Fakten oder interne Dokumente ist RAG oft praktischer, weil man die Quellen aktualisieren kann, ohne das Modell neu zu trainieren.

~~~mermaid
flowchart TB
	subgraph PREP[" "]
		direction TB
		PH["VORBEREITUNG DER WISSENSQUELLE"] --> D["Dokumente<br/>PDF, Wiki, Datenbank"]
		D --> C["Inhalte auslesen<br/>und aufteilen"]
		C --> E["Embeddings erstellen"]
		E --> V[("Suchindex")]
	end

	subgraph QUERY[" "]
		direction TB
		QH["ABFRAGE DER WISSENSQUELLE"] --> Q["Frage des Nutzers"]
		Q --> QE["Frage als Embedding"]
		QE --> S["Ähnliche Abschnitte suchen"]
		S --> R["Passende Textstellen"]
	end

    subgraph LLM[" "]
        direction LR
        LH["LLM, Z. B. CHATGPT"] --> P["Frage und Textstellen<br/>als Kontext"]
        P --> G["Antwort formulieren"]
        G --> A["Antwort an den Nutzer<br/>ggf. mit Quellen"]
    end

    V --> S
    Q --> P
    R --> P

    classDef prep fill:#DCEBFA,stroke:#2878B5,color:#123B5D,stroke-width:2px
    classDef query fill:#DDF3E4,stroke:#31945B,color:#174D2C,stroke-width:2px
    classDef llm fill:#EADFFC,stroke:#8052B8,color:#3D2860,stroke-width:2px
    classDef source fill:#F1F3F5,stroke:#6B7280,color:#202124,stroke-width:2px
    classDef prepHead fill:#2878B5,stroke:#1C5D8D,color:#FFFFFF,font-weight:bold
    classDef queryHead fill:#31945B,stroke:#247443,color:#FFFFFF,font-weight:bold
    classDef llmHead fill:#8052B8,stroke:#613A91,color:#FFFFFF,font-weight:bold

    class C,E prep
    class Q,QE,S,R query
    class P,G,A llm
    class D,V source
    class PH prepHead
    class QH queryHead
    class LH llmHead

    style PREP fill:#F4F9FE,stroke:#9CC5E5,stroke-width:2px
    style QUERY fill:#F3FBF5,stroke:#A4D4B2,stroke-width:2px
    style LLM fill:#F8F4FC,stroke:#C5A9E2,stroke-width:2px
~~~

## Embeddings

- Embeddings sind **Zahlenlisten**, die die Bedeutung von Texten oder anderen Daten abbilden.  
- Ähnliche Inhalte bekommen dabei ähnliche Zahlenwerte und liegen im **„Bedeutungsraum“ nah beieinander**.  So kann ein System passende Texte finden, auch wenn sie nicht dieselben Wörter wie die Frage enthalten.  
- Beispiel: Zur Frage „Wie kann ich mein Kennwort ändern?“ könnte es einen Abschnitt „Passwort zurücksetzen“ finden.  
- Im RAG werden solche Embeddings genutzt, um relevante Textstellen abzurufen, die das Sprachmodell anschließend für seine Antwort verwendet.
- [Text embeddings playground](https://embeddings.svana.name/app/#)

## Bedeutungsraum

- Ein **Bedeutungsraum** ist eine gedachte Landkarte, auf der Texte anhand ihrer Bedeutung als Punkte dargestellt werden. 
- Texte mit ähnlicher Bedeutung liegen nahe beieinander; inhaltlich unterschiedliche Texte liegen weiter auseinander. 
- Die Koordinaten dieser Punkte sind Zahlen aus dem Embedding, aber die einzelnen Dimensionen haben meist keine direkt verständliche Bedeutung. 
- Zum Beispiel liegen „Kennwort ändern“ und „Passwort zurücksetzen“ auf dieser Landkarte nahe beieinander
- **Wichtig**: der Bedeutungsraum ist sprach unabhängig, sprich Wörter/Sätze mit gleicher Bedeutung liegen eng beieinander, unabhängig ob Englisch, Deutsch oder Französisch.
## AI Agent

## Chunks und Overlappings

- Chunks sind kleinere Abschnitte, in die ein längeres Dokument für RAG aufgeteilt wird. 
- Zu kleine Chunks und wir haben fehlenden Kontext
- Zu große Chunks und wir bekommen schlechtere Retrieval-Qualität
- Lange Geschichten mit größerer Chunksize, da im Text viel prosa ist
- Kurzer Text mit kleinerer Chunksize, um die Feinheiten im Text besser rauszufiltern.
- z.B. Rechnungen, Bestellungen mit kleiner Chunksize, da viel Information konzentriert gespeichert wird.
- Überlappung (ca. 1-5%), dieser Text wird in 2 Chunks gespeichert; ist wichtig, damit beim Übergang von einem Chunk zum nächsten möglichtst wenig Kontext verloren geht.
- Die passenden Chunks werden zusammen mit der Frage an das LLM übergeben.
- Die Chunksize legt fest, in wie große Textstücke ein Dokument geteilt wird. Das ist nötig, damit das RAG-System nicht jedes Mal ein ganzes Buch durchsuchen und dem LLM übergeben muss.
- Ein 100-Wörter-Chunk und ein 500-Wörter-Chunk können beide Embeddings mit je 1.536 Zahlenwerten erhalten. Kleinere Chunks erzeugen allerdings mehr einzelne Embeddings und damit mehr gespeicherte Vektoren somit eine genauere Suche, wird aber bei langen Prosa-Texten zum Nachteil. Wir haben viele Vektoren aber mit wenig essenziellen Inhalt. Der Vektor beschreibt ja einen Punkt im Bedeutungsraum.

