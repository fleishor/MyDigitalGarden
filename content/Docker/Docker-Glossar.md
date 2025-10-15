---
showOnIndexPage: true
date: 2025-10-01
title: Docker - Glossar
image: Docker.png
description: Eine Übersicht über Docker und die wichtigsten Begriffe bzw. Namens-Fallen
tags:
  - Docker
---

## Docker

"Docker" ist der verworrenste Begriff, er wird für die Firma Docker, für deren Produkt Docker-Desktop, für das Konzept der Containerisierung, für die Docker-Container und für die Docker-Images verwendet. Am besten verwendet man die fachlich richtigen Begriffe.

## Container Ökosystem


![[Container.drawio.png]]


1. Tools Ebene, die zum Ausführen, Erzeugen, Verwalten von Containern verwendet wird. z.B. docker, kubectl, podman, ...
2. **Container Runtime Interface (CRI)** ist ein von Kubernetes definiertes API um mit verschiedenen Container Runtimes zu interagieren. Da es in einer Spezifikation standardisiert ist, können Sie wählen, welche CRI-Implementierung Sie verwenden möchten.
3. **containerd** wurde von Docker entwickelt. CRI-Plugin ist ein in containerd nativ integriertes, standardmäßig aktiviertes Plugin. Dadurch kann Kubernetes containerd als Container Runtime verwenden. **CRI-O** ist ein Open-Source-Projekt und eine Alternative zu containerd und wird von einer Reihe namhafter Unternehmen unterstützt.
4. Open Container Initiative (OCI) ist ein offener Industriestandard. Es enthält 2 Spezifikationen: Runtime Spezifikation (runtime spec) und die Image Spezifikation (image spec)
5. Implementierungen der OCI specification. runc ist die Referenzimplementierung, es gibt aber auch spezialisierte Alternative-Implementierungen.
6. Container, bzw. spezialisierte Container Umgebungen

## OCI Implementierungen

- **runc**: Standardimplementierung bzw. Referenzimplementierung
- **gVisor**: lässt die Container in einer Sandbox laufen; hohe Sicherheit durch zusätzliche Isolation; gVisor implementiert einen Benutzerraum-Kernel namens **Sentry**, der die Systemaufrufe des Containers abfängt und sie in eine sichere Umgebung umwandelt. Anstatt direkt mit dem Host-Kernel zu interagieren, kommuniziert der Container mit Sentry, was die Angriffsfläche verringert.
- **Kata Containers**: lässt die Container in einer Virtual Machine laufen; sehr hohe Sicherheit; Kata Containers verwendet leichtgewichtige VMs, die auf Hypervisoren basieren, um Container auszuführen. Diese VMs bieten eine starke Isolation, ähnlich wie traditionelle VMs, jedoch mit einem geringeren Overhead, was sie schneller und ressourcenschonender macht. Kata Containers unterstützt verschiedene Hypervisoren wie **QEMU**, **Firecracker** und **KVM**. Der Hypervisor verwaltet die VMs, während Kata Containers die Container innerhalb dieser VMs orchestriert.
- **LXC/LXD**: lässt Container in einer Linux-Umgebung laufen; LXC ermöglicht die Ausführung vollständiger Linux-Distributionen in Containern. Dies bedeutet, dass Benutzer eine vollständige Linux-Umgebung innerhalb eines Containers haben, die ähnlich wie eine virtuelle Maschine funktioniert, jedoch mit geringerem Overhead. z.B. Proxmox

## Docker Architektur

![[Docker.drawio.png]]

1. Die **Docker CLI** ist das Kommandozeilenwerkzeug, mit dem man Docker direkt über die Konsole oder das Terminal steuern kann. **Portainer** ist eine grafische Benutzeroberfläche (GUI) zur Verwaltung von Docker-Umgebungen.
2. Die Kommunikation zwischen Docker CLI bzw. Portainer und dem Docker-Daemon dockerd läuft (unter Linux) über einen Unix-Socket (bei Windows über eine Named Pipe). Dabei wird eine HTTP-RESTful API verwendet.
3. **dockerd**, der Docker-Dämon, ist der zentrale Prozess innerhalb der Docker-Architektur und erfüllt mehrere wichtige Funktionen:
	1.  **API-Server**: dockerd fungiert als API-Server, der HTTP-Anfragen von Clients entgegennimmt, wie zum Beispiel der Docker-CLI oder andere Anwendungen (Portainer), die mit Docker interagieren. Diese Anfragen können das Erstellen, Stoppen, Starten und Verwalten von Containern betreffen.
	2. **Verwaltung von Containern und Images**: dockerd ist für die Verwaltung der Container und deren Images verantwortlich. Dazu gehören:
		- **Erstellen**: Erstellen und Konfigurieren von Containern.
		- **Starten und Stoppen**: Starten, Stoppen und Entfernen von Containern.
		- **Image-Management**: Herunterladen, Speichern und Verwalten von Docker-Images, wobei hier vieles an **containerd** weitergeleitet wird.
	3. **Netzwerk-Management**: dockerd kümmert sich um die Netzwerkinfrastruktur für Container. Dies schließt die Erstellung und Verwaltung von Docker-Netzwerken ein, um die Kommunikation zwischen Containern zu ermöglichen.
	4. **Volumen-Management**: dockerd verwaltet Container-Volumes, die für den Datenaustausch zwischen Containern und dem Host-System verwendet werden. Diese Volumes speichern Daten, die über den Lebenszyklus der Container hinweg persistieren müssen.
	5. **Zugriffskontrolle und Sicherheit**: dockerd implementiert Sicherheitsfunktionalitäten, die den Zugriff auf Container und Images steuern. Dies kann Benutzer-Authentifizierung, Autorisierung und Konfigurationsmanagement umfassen.
	6. **Integration mit containerd**: dockerd nutzt containerd für das tatsächliche Management der Container-Lifecycle-Prozesse. Während dockerd die höheren Dienste bereitstellt, führt containerd die spezifischen Container-Operationen durch.
4. Die Kommunikateion zwischen dockerd und containerd läuft über das standardisierte CRI ab. containerd verwendet dabei gRPC via Unix-Socket /run/containerd/containerd.sock
5. **containerd** ist ein wichtiger Bestandteil der Docker-Architektur und spielt eine zentrale Rolle im Container-Lifecycle-Management. Die Hauptaufgaben von containerd umfassen: 
	1. **Container-Lifecycle-Management**: containerd verwaltet den gesamten Lebenszyklus von Containern, einschließlich:
	    - **Erstellen**: Starten und Ausführen von Containern.
	    - **Pause**: Vorübergehendes Anhalten von Containern.
	    - **Fortsetzen**: Wiederaufnahme von pausierten Containern.
	    - **Stoppen**: Beenden und Entfernen von Containern.
	2. **Image-Verwaltung**: containerd sorgt für das Herunterladen, Speichern und Verwalten von Container-Images. Dazu gehören:
		- **Pullen**: Herunterladen von Images aus einem Container-Registry.
		- **Caching**: Zwischenspeichern von Images zur Verbesserung der Leistung.
		- **Management**: Verwalten von Images, die auf dem Host installiert sind.
	3. **Interaktion mit dem Kernel**: containerd kommuniziert direkt mit dem Linux-Kernel über cgroups und Namespaces, um sicherzustellen, dass Container isoliert und ressourcenschonend betrieben werden.
	4. **API-Services**: containerd bietet APIs, über die andere Programme (wie Docker) mit ihm interagieren können. Diese APIs ermöglichen es, Container zu erstellen, zu starten und zu verwalten.
	5. **Zusammenarbeit mit Runtime**: containerd arbeitet eng mit Container-Runtimes wie runc zusammen, die tatsächlich dafür verantwortlich sind, Container zu starten und ihre Prozesse zu verwalten.
6. **runc** ist ein wesentlicher Bestandteil der Container-Technologie, der speziell für das Ausführen von Containern entwickelt wurde. Es handelt sich um ein CLI-Tool, das den Container-Runtime-Standard von Open Container Initiative (OCI) implementiert. Die Hauptaufgaben von runc sind:
	1.  **Starten von Containern**: runc ist verantwortlich für das Starten von Containern aus einem gegebenen Image. Es erstellt den Container-Prozess und verwendet dazu cgroups und Namespaces zur Isolation der Container.
	 2. **Verwaltung der Isolation**: runc sorgt für die Container-Isolierung, indem es verschiedene Linux-Technologien verwendet:
		- **Namespaces**: Diese stellen sicher, dass der Container eine eigene Ansicht der Systemressourcen hat, z. B. für Prozesse, Netzwerke, Dateien und Benutzer.
		- **cgroups**: Diese ermöglichen die Ressourcenverwaltung, indem sie Limits für CPU, RAM, I/O und andere Ressourcen setzen.
	3. **Ausführung von Container-Prozessen**: runc führt die Anwendungen innerhalb des Containers aus. Es bietet die notwendige Umgebung, um die im Container enthaltene Software korrekt laufen zu lassen.
	4. **Zugriff auf Container-Systemaufrufe**: runc ermöglicht den Zugriff auf Systemaufrufe des Host-Betriebssystems, während er gleichzeitig die Isolation aufrechterhält. Dies erlaubt den Containern, mit dem Host zu interagieren, ohne dessen Sicherheit zu gefährden.
	5. **Standardkonformität**: runc ist ein Referenz-Implementierungstool für den OCI-Runtime-Standard. Es gewährleistet, dass Container, die mit runc erstellt werden, mit anderen OCI-konformen Tools und Laufzeiten interoperabel sind.
