---
showOnIndexPage: true
date: 2025-10-01
title: Glossar
image: Docker.png
description: Eine Übersicht über Docker und die wichtigsten Begriffe bzw. Namens-Fallen
tags:
  - Docker
  - AIEnhanced
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

## Docker Netzwerk
Jeder Docker-Container bekommt standardmäßig:
- **Eine eigene Netzwerknamespace** (eigene IP, Routing-Tabelle, Interfaces)
- **Virtuelle Netzwerkschnittstellen**, meist `eth0`
- Eine IP-Adresse, die vom Docker-Netzwerk-Subsystem vergeben wird
Das Docker-Daemon verwaltet diese Netzwerke über den integrierten **Docker Network Driver**.

### Standard-Netzwerktypen

1. **bridge (Standardnetzwerk)**
- Jeder Container erhält eine eigene IP im internen Docker-Subnetz (z. B. 172.17.0.0/16)
- Das Interface im Container heißt `eth0`
- Der Host kommuniziert über das Interface `docker0`
- Netzwerkbeispiel:
~~~
$ docker run -it alpine sh 
# ifconfig eth0: inet 172.17.0.2  netmask 255.255.0.0`
~~~
- Zugriff auf das Internet erfolgt über NAT über den Host.

2. **host**
- Der Container teilt sich den Netzwerkstack mit dem Host.
- Kein separates `eth0`, IP = Host-IP.
        
3. **none**
- Der Container erhält **keine** Netzwerkschnittstelle (außer `lo`).
- Ideal für isolierte Container oder eigene manuelle Netzwerk-Setups.

### Netzwerkkonfiguration anzeigen

~~~
$ docker network ls
NETWORK ID     NAME              DRIVER    SCOPE
a2d135cd71ea   bridge            bridge    local
f4cc658795bd   elastic           bridge    local
0022fb1be500   host              host      local
5d37fb6c3f14   kind              bridge    local
c23210e10821   none              null      local
~~~

~~~
$ docker network inspect kind
[
    {
        "Name": "kind",
        "Id": "5d37fb6c3f148455fea71325c1edccb37151ca1c2847bcadb6799dc8e7159ce3",
        "Created": "2025-10-27T11:40:48.608984977Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv4": true,
        "EnableIPv6": true,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.20.0.0/16",
                    "Gateway": "172.20.0.1"
                },
                {
                    "Subnet": "fc00:f853:ccd:e793::/64",
                    "Gateway": "fc00:f853:ccd:e793::1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.driver.mtu": "1500",
            "com.docker.network.enable_ipv4": "true"
        },
        "Labels": {}
    }
]
~~~

## Docker Images

Docker **Images** sind die Grundlage von Containern. Man kann sie sich wie eine **unveränderliche Bauvorlage oder ein fertiges Abbild einer Anwendung** vorstellen.

### Eigenschaften

- **Unveränderlich (immutable)**: Wird nicht verändert, sondern neu gebaut
- **Schichten (Layers)**: Images bestehen aus mehreren übereinanderliegenden Layers; spart Speicher und beschleunigt Builds
- **Wiederverwendbar**: Gleiches Image überall nutzbar (lokal, Server, Cloud) und kann auch von unterschiedlichen Container verwendet werden (siehe [[Secrets]] )

### Woher kommen die Images?

- Docker Hub oder ein anderes Image Registry
- Private Registries
- Lokales Dateisystem

### Aufbau in Images

Ein Docker Image ist intern ziemlich strukturiert aufgebaut; nicht eine einfache Datei, sondern ein **Stapel von Schichten (Layers)** plus Metadaten.

Ein Image besteht aus mehreren **übereinanderliegenden Read-Only-Layern**:

~~~
Layer 5: [ Application Layer ]  
Layer 4: [ Dependencies Layer ]  
Layer 3: [ Runtime Layer (z. B. Node, Python, Nginx) ]  
Layer 2: [ Update Layer ]  
Layer 1: [ Base Image (z. B. Ubuntu, Alpine) ]
~~~

Jeder Schritt im Dockerfile erzeugt typischerweise einen neuen Layer.

~~~dockerfile
FROM ubuntu:22.04             # Layer 1 (Base Image)
RUN apt-get update            # Layer 2 (Update Layer)
RUN apt-get install -y nginx  # Layer 3 (Runtime Layer)
COPY . /app                   # Layer 5 (Application Layer)
CMD ["nginx", "-g", "daemon off;"]  # Metadaten (kein Layer)
~~~

### Woraus besteht ein Image?

1. **Layer (Dateisystem)**

- Dateien, Programme, Libraries
- Jeder Layer speichert nur **Unterschiede zum vorherigen**
- Layers können zwischen Image geshared werden
- Layers werden auf dem Client auch gecached, sodass beim docker pull nur die geänderten Layers übertragen werden
- Die Layers werden mittels UnionFS übereinander gelegt, sodass es für den Container nach nur einem Filesystem aussieht. 
- Analog zu UnionFS ist nur der oberste Layer ReadWrite. Sobald der Container gelöscht wird, wird auch der oberste ReadWrite-Layer gelöscht.

2. **Image-Konfiguration (Metadata)**
 
 - Startbefehl (`CMD`, `ENTRYPOINT`)
- Umgebungsvariablen (`ENV`)
- Arbeitsverzeichnis (`WORKDIR`)
- Ports (`EXPOSE`)

3. **Manifest**

- Beschreibt, **welche Layer zusammengehören**
- Wird z. B. beim `docker pull` genutzt

### Layer anschauen

~~~
docker history secrets:latest
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
59240a08f96a   6 minutes ago   CMD ["node" "dist/server.js"]                   0B        buildkit.dockerfile.v0
<missing>      6 minutes ago   EXPOSE [3000/tcp]                               0B        buildkit.dockerfile.v0
<missing>      6 minutes ago   COPY /app/dist ./dist # buildkit                2.57kB    buildkit.dockerfile.v0
<missing>      6 minutes ago   RUN /bin/sh -c npm install # buildkit           240MB     buildkit.dockerfile.v0
<missing>      6 minutes ago   COPY package.json ./ # buildkit                 871B      buildkit.dockerfile.v0
<missing>      6 minutes ago   WORKDIR /app                                    0B        buildkit.dockerfile.v0

<missing>      22 hours ago    CMD ["node"]                                    0B        buildkit.dockerfile.v0
<missing>      22 hours ago    ENTRYPOINT ["docker-entrypoint.sh"]             0B        buildkit.dockerfile.v0
<missing>      22 hours ago    COPY docker-entrypoint.sh /usr/local/bin/ # …   388B      buildkit.dockerfile.v0
<missing>      22 hours ago    RUN /bin/sh -c apk add --no-cache --virtual …   5.36MB    buildkit.dockerfile.v0
<missing>      22 hours ago    ENV YARN_VERSION=1.22.22                        0B        buildkit.dockerfile.v0
<missing>      22 hours ago    RUN /bin/sh -c addgroup -g 1000 node     && …   146MB     buildkit.dockerfile.v0
<missing>      22 hours ago    ENV NODE_VERSION=24.15.0                        0B        buildkit.dockerfile.v0

<missing>      40 hours ago    CMD ["/bin/sh"]                                 0B        buildkit.dockerfile.v0
<missing>      40 hours ago    ADD alpine-minirootfs-3.23.4-x86_64.tar.gz /…   8.45MB    buildkit.dockerfile.v0
~~~

- Die untersten Layers sind das Alpine-Linux System
- dann komm die Nodejs installation
- und ganz oben die Anwendung

## Docker Volumes

Docker Volumes sind eine Möglichkeit, **Daten außerhalb eines Containers dauerhaft zu speichern**. Normalerweise sind Container ja „flüchtig“, wenn du sie löscht, sind auch alle darin gespeicherten Daten weg.

Ein Volume wird vom Docker-Host verwaltet und in den Container „eingehängt“ (gemountet).

~~~
docker run -v mein_volume:/app/data my_container
~~~

- `mein_volume` → das Volume
- `/app/data` → Ordner im Container

Alles, was der Container im Verzeichnis /app/data speichert, landet im Volume. Der Speicherort des Volums auf dem Host wird von Docker verwaltet (meistens unter /var/lib/docker/volumes)

## Docker Bind Mounts

Docker **Bind Mounts** sind eine andere Art, Daten in einen Container einzubinden – aber im Gegensatz zu Volumes greifst du dabei **direkt auf einen Ordner oder eine Datei auf deinem Host-System zu**.

~~~
docker run -v /home/user/mein_ordner:/app/data my_container
~~~

oder moderner

~~~
docker run --mount type=bind,source=/home/user/mein_ordner,target=/app/data my_container
~~~

- `/home/user/mein_ordner` → Ordner auf deinem Rechner (Host)
- `/app/data` → Ordner im Container

Alles, was im Container unter `/app/data` speichert, passiert **direkt im Host-Ordner**.

Eigenschaften von Bind Mounts:

- **Direkter Zugriff auf Host-Dateien bzw. Devices bei Linux**
- Änderungen sind **sofort sichtbar (in beide Richtungen)**
- Kein „Docker-verwalteter Speicher“ wie bei Volumes
- Funktioniert mit Verzeichnissen und Dateien
