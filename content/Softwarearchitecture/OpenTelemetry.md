---
showOnIndexPage: true
draft: true
date: 2026-08-07
title: OpenTelemetry
image: OpenTelemetry.png
description: 
tags:
  - Softwarearchitecture
  - OpenTelemetry
---

## Übersicht

OpenTelemetry (OTel) ist ein Standard und ein Framework, mit dem Anwendungen [[Observability]]-Daten erzeugen, z. B.:

- Traces: Ablauf einer Anfrage durch mehrere Services
- Metriken: Zahlenwerte wie Latenz, Fehlerquote
- Logs: je nach Setup

Die Idee: Deine App instrumentiert sich mit OpenTelemetry, und die Daten können dann an verschiedene Backends geschickt werden (z. B. [[Grafana Tools]] :Tempo für Traces, Loki für Logs, Mimir für Metriken) – ohne dass du jeweils direkt proprietäre APIs der einzelnen Systeme nutzen musst.

