---
showOnIndexPage: false
draft: true
date: 2025-04-08
title: Clean Architecture
image: Softwarearchitecture.png
description: Clean Architecture ist ein Softwareentwicklungsansatz, der darauf abzielt, Systeme modular und unabhängig von Frameworks zu gestalten. Es trennt Geschäftslogik und Implementierungsdetails, sodass Änderungen in einer Schicht die anderen nicht beeinflussen. Dies fördert die Wartbarkeit und Testbarkeit der Software.
tags:
  - Softwarearchitecture
---

## All-In-One-Architecture

Die "All-in-One-Architektur", auch bekannt als monolithische Architektur, ist ein traditioneller Softwaredesignansatz, bei dem alle Komponenten einer Anwendung eng in einem einzigen Codebasis integriert sind und als eine Einheit bereitgestellt werden. Dies umfasst die Benutzeroberfläche, Geschäftslogik und Datenzugriff.

Diese Architektur ist einfach zu entwickeln und zu deployen, kann jedoch bei wachsender Anwendung schwer zu warten und zu skalieren sein.

## Layered Architecture

Die "Layered Architecture" (auch Schichtenarchitektur genannt) ist ein Softwaredesignansatz, bei dem die Anwendung in verschiedene, klar getrennte Schichten unterteilt wird. Jede Schicht hat eine spezifische Rolle und Verantwortung:

- **Präsentationsschicht**: Diese Schicht ist für die Benutzeroberfläche und die Interaktion mit dem Benutzer zuständig.
- **Geschäftsschicht**: Hier wird die Geschäftslogik implementiert.
- **Datenzugriffsschicht**: Diese Schicht kümmert sich um den Zugriff auf Datenquellen wie Datenbanken.
- **Infrastrukturschicht**: Diese Schicht unterstützt die anderen Schichten durch allgemeine Dienste wie Logging oder Netzwerkkommunikation.

Diese Struktur fördert die Modularität und erleichtert die Wartung und Erweiterung der Anwendung.


