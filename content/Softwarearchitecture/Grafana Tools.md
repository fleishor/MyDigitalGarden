---
showOnIndexPage: true
date: 2026-08-07
title: Granfa Tools and Toolstacks
image: Grafana.png
description: Eine kurze Übersicht über alle Grafana Tools bzw. die Grafana Toolstacks
tags:
  - Softwarearchitecture
  - Grafana
---

## Grafana

"A project for frontend application observability, Grafana Faro includes a highly configurable web SDK for real user monitoring (RUM) that instruments browser frontend applications to capture observability signals. The frontend telemetry can then be correlated with backend and infrastructure data for seamless, full-stack observability."

## Mimir

"Mimir is an open source, horizontally scalable, highly available, multi-tenant TSDB for long-term storage for Prometheus."

Grafana Mimir ist ein Open-Source-System, das zeitbasierte Messdaten wie Prometheus/“Metrics” speichert und abfragt – also eine skalierbare Metrik-Datenplattform.

- Sammlung/Produktion: Metriken kommen von Prometheus (oder kompatiblen Quellen) und werden an Mimir geschickt.
- Speicherung: Mimir speichert die Zeitreihen (mit deutlich größerem Skalierungs-Fokus als “ein einzelner Prometheus-Server”).
- Abfrage: Grafana (und andere Clients) können die Daten über eine Prometheus-kompatible API abfragen.
- Warum es genutzt wird: Wenn man Prometheus allein nicht mehr ausreichend skalieren kann (z. B. viele Targets, viele Daten, lange Retention, Multi-Tenancy).

## Loki

"Loki is a log aggregation system designed to store and query logs from all your applications and infrastructure."

Grafana Loki ist ein System zum Speichern und Abfragen von Logs (Protokollen).

- Loki nimmt Logs entgegen (oft über Promtail) und speichert sie so, dass sie später wieder abfragbar sind.
- Logs werden mit Labels (z. B. `host`, `job`, `app`, `namespace`) versehen; damit filtert man die richtigen Logströme.
- Dann kann Grafana die Logs durchsuchen, anzeigen und mit Dashboards/Prometheus-Metriken kombinieren.

## Promtail

Grafana Promtail ist separates Tool von Grafana Labs, das Logs sammelt und an Loki weiterleitet.

- Promtail liest Logzeilen aus Dateien oder (z. B. in Docker/Kubernetes) aus Container-Logs,
- setzt Labels (z. B. welche App/Host/Job),
- und schickt die Logs an Grafana Loki,
- damit sie später in Grafana über Loki gesucht und angezeigt werden können.


## Telegraf

Grafana Telegraf ist ein Agent zur Sammlung von System- und Anwendungsmetriken.

- Sammelt: CPU, RAM, Disk, Netzwerk, Service-Statistiken usw. (über sogenannte _Input_-Plugins)
- Optional transformiert/aggregiert: z. B. Werte filtern oder umrechnen (_processors_)
- Sendet weiter: an ein Ziel (_outputs_), z. B. InfluxDB, Prometheus Remote Write oder andere Monitoring-Backends
- Nutzen: Für Monitoring/Alerting, weil du kontinuierlich Metriken in eine Zeitreihen-Datenbank einspeist.

## Tempo

"Grafana Tempo lets you scale tracing as far as possible with minimal operational cost and less complexity than ever before."

Grafana Tempo ist ein System zum Speichern und Abfragen von Distributed Tracing – also Ablauf-/Diagnosedaten, die zeigen, wie sich eine Anfrage durch viele Services (Microservices) bewegt.

- Man verfolgt z. B. „ein Request durchläuft Service A → B → Datenbank“ und misst dabei Latenzen.
- Instrumentierung/Tracing-Clients erzeugen Spans (z. B. via OpenTelemetry) und schicken sie an Tempo.
- Grafana kann Tempo-Daten visualisieren, sodass du Laufzeitprobleme/Engpässe schnell findest.

## Pyroscope

"Grafana Pyroscope is an open source continuous profiling database that provides fast, scalable, highly available, and efficient storage and querying. This helps you get a better understanding of resource usage in your applications down to the line number."

Grafana Pyroscope ist ein Tool für Profiling (Performance-Diagnose) von Anwendungen.

- Was es macht: Es sammelt „Profil“-Daten wie CPU-/Memory-Verhalten über die Zeit.
- Wofür: Damit findest du Hotspots wie Funktionen/Codepfade, die am meisten CPU verbrauchen oder wo Zeit/ Ressourcen verloren gehen.
- Wie es eingebunden ist: Deine App instrumentiert/erzeugt Profile (z. B. für Go/Java/Node etc.), Pyroscope nimmt sie entgegen und Grafana zeigt sie dann in Visualisierungen an.

## Alloy

"Grafana Alloy is an open source OpenTelemetry collector with built-in Prometheus pipelines and support for metrics, logs, traces, and profiles."

Grafana Alloy ist ein “Data Collector/Agent” von Grafana, der (vergleichbar mit Promtail/Telegraf je nach Setup) Daten aus verschiedenen Quellen einsammelt, verarbeitet und weiterleitet – typischerweise zu Backends wie Grafana Loki (Logs), Grafana Mimir (Metriken) oder Tempo (Traces).

- Sammelt: Logs/Events/Metriken/Traces (je nach Konfiguration)
- Verarbeitet: Filter, Umformungen, Routing
- Leitet weiter: an die passenden Grafana-Backends
- Ziel: Eine einheitlichere, flexible “Pipe” für Observability statt mehrere einzelne Agents.

## Faro

"A project for frontend application observability, Grafana Faro includes a highly configurable web SDK for real user monitoring (RUM) that instruments browser frontend applications to capture observability signals. The frontend telemetry can then be correlated with backend and infrastructure data for seamless, full-stack observability."

Grafana Faro ist ein Frontend-Tool für Error-/Session-Observability: Es hilft dabei, Browser- und User-Ablaufdaten (z. B. Fehler, Performance/Heuristiken, Session-Infos) zu erfassen und an ein Observability-Backend zu senden—typisch im Zusammenspiel mit Grafana und OpenTelemetry.

- Erfasst im Web: Fehler/Issues und relevante Laufzeitereignisse im Browser.
- Betont Kontext: Welche Seite/Route, welche Aktionen, oft auch Session-/Nutzungszusammenhang.
- Sendet an: ein Tracing/Logs/Monitoring-Backend (abhängig von deiner Grafana-Setup-Konfiguration).
- 