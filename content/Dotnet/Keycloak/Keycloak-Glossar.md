---
showOnIndexPage: true
date: 2025-03-17
title: Keycloak - Glossar
image: Keycloak.png
description: 
tags:
  - Keycloak
  - OAuth2
  - OpenIdConnect
  - (OIDC)
---

## Referenzen

- [Keycloak Node.js adapter](https://www.keycloak.org/securing-apps/nodejs-adapter)
- [An Introduction to OAuth 2](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)
- [Apps Developer Blog - Keycloak](https://www.appsdeveloperblog.com/category/keycloak/)
- [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/index.html)
- [JWT standard](https://www.iana.org/assignments/jwt/jwt.xhtml)
- [Keycloak](https://www.youtube.com/playlist?list=PLeLcvrwLe187DykEKXg-9Urd1Z6MQT61d)

## Realm

Ein Realm in Keycloak ist eine grundlegende Verwaltungseinheit, die eine Gruppe von Benutzern, Anwendungen und Rollen umfasst. Jeder Realm ist eine separate Sicherheitsdomäne mit eigenen Anmelde- und Verwaltungsrichtlinien. Hier sind einige wichtige Punkte:

- **Isolation**: Realms sind voneinander isoliert, sodass Benutzer und Konfigurationen in einem Realm nicht auf andere Realms zugreifen können.
- **Benutzerverwaltung**: Jeder Realm hat seine eigenen Benutzer, Gruppen und Rollen.
- **Anwendungen**: Anwendungen und Dienste werden innerhalb eines Realms registriert und verwaltet.
- **Konfiguration**: Authentifizierungs- und Autorisierungsrichtlinien werden pro Realm konfiguriert.

Ein Realm ermöglicht es, verschiedene Sicherheitsdomänen innerhalb einer Keycloak-Instanz zu verwalten, was besonders nützlich ist, wenn du mehrere Projekte oder Mandanten hast, die getrennt voneinander verwaltet werden sollen.

## Audience

In Keycloak bezieht sich der Begriff Audience (Zielgruppe) auf die Entität(en), für die ein Access Token bestimmt ist. Die Audience wird im Access Token durch den aud-Claim angegeben. Dieser Claim gibt an, welche Dienste oder APIs das Token akzeptieren und verwenden dürfen.

Die Audience ist besonders wichtig, um sicherzustellen, dass ein Access Token nur von den vorgesehenen Empfängern verwendet wird. Dies hilft, die Sicherheit zu erhöhen, indem verhindert wird, dass ein Token von nicht autorisierten Diensten missbraucht wird.

## OAuth Rollen

OAuth definiert vier Hauptrollen:

- **Resource Owner**: Die **Person** oder Entität, die die Daten besitzt und deren Zugriff kontrolliert.
- **Client**: Die **Anwendung**, die im Auftrag des Resource Owners auf die Daten zugreifen möchte.
- **Authorization Server**: Der Server, der die Authentifizierung des Resource Owners durchführt und Zugriffstoken ausstellt.
- **Resource Server**: Der Server, der die Daten hostet und die Zugriffstoken überprüft, um den Zugriff zu gewähren.

## Basis Authentication Ablauf

~~~mermaid
sequenceDiagram
    User ->> Application: 1. Start Application
    Application ->> User: 2. Authorization Request
    User ->> Application: 3. Authorization Grant
    Application ->> Authorization Server: 4. Authorization Grant
    Authorization Server ->> Application: 5. Access Token
    Application ->> Resource Server: 6. Access Token
    Resource Server ->> Application: 7. Daten, ...
~~~

1. Der Anwender startet die Anwendung, in dem er z.B. eine Website im Brower öffnet
2. Die Webanwendung leitete den Anwender auf eine Login-Seite weiter
3. Der Anwender gibt seinen Benutzerkennung und Passwort ein und schickt die Seite ab
4. Die Anwendung fordert vom Authorization-Server ein Accesstoken an.
5. Falls die Anwendungs-Id (ClientId) und der Authorization-Grant gültig sind, gibt der Authorization-Server eine Accesstoken zurück
6. Mit dem Accesstoken kann man beim Resource-Server nach den Daten fragen
7. Falls der Resource-Server das Accesstoken akzeptiert gibt es die Daten zurück.

Das ist ein grober Ablauf; der aktuelle Ablauf hängt vom verwendeten  "authorization grant type" ab

## Authorization Grant Types

- **Authorization Code Grant**: Dies ist der am häufigsten verwendete Grant-Typ, besonders für Webanwendungen. Der Benutzer authentifiziert sich bei einem Autorisierungsserver, der dann einen Autorisierungscode zurückgibt. Dieser Code wird anschließend gegen ein Zugriffstoken eingetauscht.
- **Implicit Grant**: Dieser Typ wird hauptsächlich für Single-Page-Anwendungen (SPAs) verwendet, bei denen das Zugriffstoken direkt vom Autorisierungsserver an den Client zurückgegeben wird, ohne dass ein Autorisierungscode erforderlich ist.
- **Resource Owner Password Credentials Grant**: Auch bekannt als **Direct Grant in Keycloak**. Hierbei gibt der Benutzer seine Anmeldedaten direkt an den Client weiter, der diese dann verwendet, um ein Zugriffstoken zu erhalten. **Dieser Grant-Typ wird aus Sicherheitsgründen weniger empfohlen**.
- **Client Credentials Grant**: Dieser Grant-Typ wird verwendet, wenn der Client selbst (und nicht ein Benutzer) autorisiert werden muss, um auf Ressourcen zuzugreifen. Dies ist typisch für serverseitige Anwendungen.
- **Device Authorization Grant**: Dieser Typ wird für Geräte verwendet, die keine einfache Möglichkeit haben, Benutzereingaben zu akzeptieren, wie z.B. Smart-TVs oder IoT-Geräte. Der Benutzer gibt einen Code auf einem separaten Gerät ein, um den Zugriff zu autorisieren.
