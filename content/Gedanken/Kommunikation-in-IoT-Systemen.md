---
showOnIndexPage: false
draft: true
date: 2025-01-09
title: Kommunikation in IoT-Systemen
image: 
description: 
tags: 
  - Gedanken
---

- Menschliche Kommunikation ist ihrer Natur nach synchron;Menschen erwarten in der Regel eine unmittelbare Reaktion auf ihre Handlungen. Wenn jemand zum Beispiel eine Schaltfläche im Browser anklickt, erwartet er, dass die entsprechende Aktion sofort sichtbar wird, wie das Laden einer neuen Seite oder das Anzeigen einer Meldung. Diese Erwartung an sofortige Rückmeldungen ist ein wesentlicher Aspekt der Benutzerfreundlichkeit und des Designs von interaktiven Systemen. Verzögerungen oder fehlende Rückmeldungen können zu Frustration führen, da sie nicht dem natürlichen Kommunikationsfluss entsprechen, den Menschen gewohnt sind.

- Maschine-Maschine-Kommunikation läuft häufig asynchron ab. Der Hauptvorteil dieser asynchronen Kommunikation liegt in der besseren Skalierbarkeit. Asynchrone Systeme können effizienter mit einer großen Anzahl von Anfragen umgehen, da sie nicht darauf warten müssen, dass jede Anfrage sofort beantwortet wird. Dies reduziert die Belastung und verbessert die Leistung, insbesondere bei hohem Datenverkehr. Ein Beispiel für asynchrone Kommunikation ist das Senden einer E-Mail. Der Absender muss nicht darauf warten, dass der Empfänger die Nachricht sofort liest und beantwortet. Stattdessen kann der Empfänger die Nachricht zu einem späteren Zeitpunkt abrufen und beantworten.

- Um Interaktion zwischen Field-Gateway und Rechenzentrum zu ermöglichen, haben sich zwei Protokolle etabliert: MQTT und AMQP
AMQP ist HTTP-REST Protokoll
MQTT: Nachrichtenprotokoll für eingeschränkte, unzuverlässige Netzwerke, wenig Energie, wenig Daten, nur Publish-Subscribe, keine Warteschlange, keine Punkt-zu-Punkt-Verbindung, erneute Auslieferung im Protokoll
