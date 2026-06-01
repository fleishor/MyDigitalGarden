---
showOnIndexPage: true
date: 2026-04-15
title: Secrets
image: Docker.png
description: Das Projekt "Secrets" ist ein Proof of Concept (PoC), das demonstriert, wie Docker Secrets und Configs in einer containerisierten Umgebung verwaltet und genutzt werden.
tags:
  - Docker
  - AIEnhanced
---

## Projektübersicht

Das Projekt **"Secrets"** ist ein Proof of Concept (PoC), das demonstriert, wie Docker Secrets und Configs in einer containerisierten Umgebung verwaltet und genutzt werden. Es zeigt verschiedene Szenarien für den Umgang mit sensitiven Daten und Konfigurationsdateien in Docker Compose.

## Projektstruktur

~~~

Secrets/
├── src/
│   └── server.ts              # Express-Server mit Secret-Management-Logik
├── Dockerfile                 # Multi-Stage Docker Build
├── docker-compose.yml         # Service-Definition mit Secrets und Configs
├── .env                       # Lokale Umgebungsvariablen
├── appconfig.json             # Anwendungskonfiguration (als Docker Config)
├── apikey.txt                 # API-Key (als Docker Secret)
~~~

## Docker Services & Secrets Management

### Konfigurierte Services (3 Varianten)

Das `docker-compose.yml` definiert drei verschiedene Services zur Demonstration unterschiedlicher geheimer Daten-Verwaltung:

#### 1. **secretswithapikey** (Port 3000)

**Szenario:** Beide Datenquellen sind verfügbar

Vollständiges Setup mit Secret und Config:

~~~yaml
- Secrets:     ✅ API-Key aus apikey.txt
- Configs:     ✅ appconfig.json
- Environment: ✅ Beide Pfade verfügbar
~~~

#### 2. **secretswithoutapikey** (Port 3001)

**Szenario:** Secret-Fallback-Verhalten testen

Kein Secret, aber Config vorhanden:

~~~yaml
- Secrets:     ❌ NICHT verfügbar
- Configs:     ✅ appconfig.json
- Environment: ✅ Nur Config-Pfad sichtbar
~~~

#### 3. **secretswithoutapikeyandconfig** (Port 3002)

**Szenario:** Fallback auf Standard-Werte

Minimal-Setup ohne externe Dateien:

~~~yaml
- Secrets:     ❌ NICHT verfügbar
- Configs:     ❌ NICHT verfügbar
- Environment: ✅ Nur Umgebungsvariablen
~~~

### Mounted Pfade in Containern 

## Secrets

![[Secrets.png]]

1. apikey.txt ist der Name des secrets; nicht der Dateiname, ich habe hier nur die gleichen Namen verwendet.
2. apikey.txt ist nur der Name, über file wird die Datei festgelegt, aus der das Secret gelesen wird
3. Über die Umgebungsvariable API_KEY_FILE weis die Anwendung aus welcher Datei im Container der APIKey gelesen werden kann.

Secrets werden standardmäßig in das Verzeichnis /run/secrets gemounted.

~~~bash
> docker inspect secretswithapikey --format '{{ json .Mounts }}' | jq
~~~

~~~json
[
  {
    "Type": "bind",
    "Source": ".\\MyDevelopment\\POCs\\Docker\\Secrets\\apikey.txt",
    "Destination": "/run/secrets/apikey.txt",
    "Mode": "",
    "RW": false,
    "Propagation": "rprivate"
  }
]
~~~

In der Anwendung kann dann über FileIO der APIKey eingelesen werden:

~~~typescript
const getApiKey = (): null | string => {
  // Try to read from Docker secret file first
  const secretFile = process.env.API_KEY_FILE;
  console.info("Attempting to read API key from secret file:", secretFile);
  if (secretFile && fs.existsSync(secretFile)) {
    try {
      return fs.readFileSync(secretFile, "utf8").trim();
    } catch (error) {
      console.error("Error reading API key from secret file:", error);
    }
  }
  
  // Fallback to environment variable
  return process.env.API_KEY ?? null;
};
~~~

## Configs

![[Configs.png]]

1. appconfig.json ist der Name des configs; nicht der Dateiname, ich habe hier nur die gleichen Namen verwendet. Da die configs standardmäßig ins Root-Verzeichnis gemappt werden, wurde hier mit target die Zieldatei gesetzt.
2. appconfig.json ist nur der Name, über file wird die Datei festgelegt, aus der die Configs gelesen werden
3. Über die Umgebungsvariable CONFIG_FILE weis die Anwendung aus welcher Datei im Container die Configs gelesen werden können.

Configs werden standardmäßig in das Verzeichnis Root-Verzeichnis gemounted.

~~~bash
> docker inspect secretswithapikey --format '{{ json .Mounts }}' | jq
~~~

~~~json
[
  {
    "Type": "bind",
    "Source": ".\\MyDevelopment\\POCs\\Docker\\Secrets\\appconfig.json",
    "Destination": "/run/configs/appconfig.json",
    "Mode": "",
    "RW": false,
    "Propagation": "rprivate"
  }
]
~~~

In der Anwendung kann dann über FileIO die Configs eingelesen werden:

~~~typescript
// Configuration interface
interface AppConfig {
  apikey: string;
  port: number;
  source: string;
}
  
// Type guard to validate AppConfig
const isAppConfig = (obj: unknown): obj is AppConfig => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).port === "number" &&
    typeof (obj as Record<string, unknown>).source === "string" &&
    typeof (obj as Record<string, unknown>).apikey === "string"
  );
};
  
// Function to load configuration
const loadConfig = (): AppConfig => {
  const configFile = process.env.CONFIG_FILE;
  console.info("Loading configuration from file:", configFile);
  if (configFile && fs.existsSync(configFile)) {
    try {
      const configData = fs.readFileSync(configFile, "utf8");
      const parsed: unknown = JSON.parse(configData);
      if (isAppConfig(parsed)) {
        return parsed;
      }
      console.warn(
        "Config file does not match AppConfig schema, using defaults",
      );
    } catch (error) {
      console.error("Error reading config file:", error);
    }
  }
  return {
    apikey: process.env.API_KEY ?? "baken-api-key",
    port: Number(process.env.PORT ?? "3000"),
    source: process.env.SOURCE ?? "baken-source",
  };
};
  
const config = loadConfig();
const port = config.port;
~~~

## Server-Implementierung

### Express-Server (server.ts)

#### Konfiguration laden (`loadConfig()`)

1. Prüft Umgebungsvariable `CONFIG_FILE`
2. Versucht JSON aus Datei zu laden
3. Validiert gegen AppConfig-Schema (Type Guard)
4. Fallback auf Standard-Werte mit Umgebungsvariablen

~~~typescript
interface AppConfig {
  apikey: string;
  port: number;
  source: string;
}
~~~

#### API-Key abrufen (`getApiKey()`)

Priorität:

1. Versucht Secret-Datei zu lesen (`API_KEY_FILE`)
2. Fallback auf Umgebungsvariable `API_KEY`
3. Rückgabe `null` wenn nichts verfügbar

### API-Endpoints

| Endpoint | Methode | Beschreibung |
| --- | --- | --- |
| `/` | GET | Basis-Health-Check |
| `/health` | GET | Detaillierte Integritätsprüfung mit Uptime |
| `/apikey` | GET | Zeigt verfügbare Secret-Quellen |
| `*` (alle anderen) | - | 404-Fehler |

#### `/apikey` Antwort-Format

~~~json
{
  "apiKeyFromConfig": "apikey-from-appconfig.json",
  "apiKeyFromSecrets": "content-of-apikey.txt",
  "source": "appconfig.json"
}
~~~

## Konfigurationsdateien

### .env (Lokale Entwicklung)

~~~properties
PORT=3000                           # Server-Port
NODE_ENV=development                # Umgebung
SOURCE=.env-file                    # Konfigurationsquelle
API_KEY_FILE=./apikey.txt           # Lokaler Secret-Pfad
CONFIG_FILE=./appconfig.json        # Lokale Config
~~~

### appconfig.json (Docker Config)

~~~json
{
  "port": 3000,
  "source": "appconfig.json",
  "apikey": "apikey-from-appconfig.json"
}
~~~

### apikey.txt (Docker Secret)

Enthält den API-Key als Plain-Text (in Production in verschlüsselter Form).

## Verwendete Konzepte

### Docker Secrets

- Sichere Speicherung sensitiver Daten
- Im Test: `apikey.txt`
- Verfügbar unter `/run/secrets/apikey.txt` im Container
- Nur für Services verfügbar, die das Secret referenzieren

### Docker Configs

- Nicht-sensible Konfigurationsdateien
- Im Test: `appconfig.json`
- Verfügbar unter `/run/configs/` im Container
- Lesbar von allen Services

### Fallback-Mechanismen

Der Server demonstriert mehrschichtige Fallbacks:

1. **Konfiguration:** Datei → Umgebungsvariablen → Standard
2. **API-Key:** Secret-Datei → Umgebungsvariable → null

## Build & Deployment

### Lokale Entwicklung

~~~bash
# Dependencies installieren
npm install

# Hot-Reload Entwicklung
npm run dev

# TypeScript Type-Check
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code-Formatierung
npm run format
npm run format:check

# Production-Build
npm run build
~~~

### Docker Build & Start

~~~bash
# Docker image erzeugen
docker build -t secrets:latest .

# Serivce starten
docker compose up

# Services stoppen
^C
~~~

### Services testen

~~~bash
# Service 1 (mit Secret & Config)
curl -s http://localhost:3000/apikey | jq
{
  "apiKeyFromConfig": "apikey-from-appconfig.json",
  "apiKeyFromSecrets": "apikey-from-apikey.txt",
  "source": "appconfig.json"
}
~~~

~~~bash
# Service 2 (nur Config)
curl -s http://localhost:3001/apikey | jq
{
  "apiKeyFromConfig": "apikey-from-appconfig.json",
  "apiKeyFromSecrets": null,
  "source": "appconfig.json"
}~~~

~~~bash
# Service 3 (nur Umgebungsvariablen)
curl -s http://localhost:3002/apikey | jq
{
  "apiKeyFromConfig": "baken-api-key",
  "apiKeyFromSecrets": null,
  "source": "environment variable"
}
~~~
