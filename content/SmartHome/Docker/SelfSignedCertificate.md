---
showOnIndexPage: true
date: 2025-09-25
title: Self-Signed Certificate
description: Erzeugt für den Host docker.fritz.box ein Self-Signed Certificate mit RootCA FleisHor.CA
image: SSLCertificate.png
tags:
  - Docker
---

## Commands

~~~bash
# Generiert einen 4096-Bit RSA-Privatschlüssel (PEM-Format) in FleisHor.CA.key
openssl genrsa -out FleisHor.CA.key 4096
# Erstellt ein selbstsigniertes Zertifikat für die CA mit einer Gültigkeit von 390 Tagen
openssl req -x509 -new -nodes -key FleisHor.CA.key -sha256 -days 390 -out FleisHor.CA.crt -subj "/C=DE/ST=BY/O=FleisHor/CN=FleisHor.CA"

# Kopiert das CA-Zertifikat in das Verzeichnis für lokale CA-Zertifikate
sudo cp FleisHor.CA.crt /usr/local/share/ca-certificates/FleisHor.CA.crt
# Aktualisiert die CA-Zertifikate
sudo update-ca-certificates

# Überprüft, ob das CA-Zertifikat erfolgreich hinzugefügt wurde
awk -v cmd='openssl x509 -noout -subject' '/BEGIN/{close(cmd)};{print | cmd}' < /etc/ssl/certs/ca-certificates.crt | grep FleisHor.CA

# Erstellt einen 4096-Bit RSA-Privatschlüssel für die Domain und speichert ihn in der Datei docker.fritz.box.key
openssl genrsa -out docker.fritz.box.key 4096
# Erstellt eine Zertifikatsanforderung (CSR) für die Domain
openssl req -new -key docker.fritz.box.key -out docker.fritz.box.csr -subj "/C=DE/ST=BY/O=FleisHor/CN=docker.fritz.box"
# Signiert die CSR mit dem CA-Zertifikat und erstellt ein Zertifikat für die Domain
openssl x509 -req -in docker.fritz.box.csr -CA FleisHor.CA.crt -CAkey FleisHor.CA.key -CAcreateserial -out docker.fritz.box.crt -days 390 -sha256 -extfile docker.fritz.box.ext

# Setzt die Berechtigungen für die Schlüsseldateien
chmod 644 *.key

# Entfernt das alte SSL-Bundle-Zertifikat, falls vorhanden
rm ssl-bundle.crt

# Fügt das Domain-Zertifikat und das CA-Zertifikat zu einem Bundle-Zertifikat zusammen
cat docker.fritz.box.crt FleisHor.CA.crt >> ssl-bundle.crt

# Kopiert die Schlüssel- und Zertifikatsdateien in die nginx-Konfigurationsverzeichnisse
sudo -u nginx cp ./docker.fritz.box.key ../../../nginx/etc_ssl/
sudo -u nginx cp ./ssl-bundle.crt ../../../nginx/etc_ssl/

# Kopiert das RootCA Zertifikate in den WebSpace von Nginx, somit kann die RootCA auf anderen Client installiert werden.
sudo -u nginx cp ./FleisHor.CA.crt ../../../nginx/www/certificate/
 
# Kopiert die Schlüssel- und Zertifikatsdateien in die Vaultwarden-Konfigurationsverzeichnisse
sudo -u vaultwarden cp ./docker.fritz.box.key ../../../vaultwarden/etc_ssl/
sudo -u vaultwarden cp ./ssl-bundle.crt ../../../vaultwarden/etc_ssl/

# Kopiert das Bundle-Zertifikat in das allgemeine SSL-Verzeichnis
sudo cp ./ssl-bundle.crt /etc/ssl/
~~~

