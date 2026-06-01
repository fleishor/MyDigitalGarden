---
showOnIndexPage: true
date: 2025-10-01
title: Compose - Glossar
image: Docker.png
description: Eine Übersicht über Docker-Compose
tags:
  - Docker
---

## dockerfile
~~~dockerfile
FROM nginx:stable-alpine

# Metadaten (optional)
LABEL maintainer="dein-name@example.com"
LABEL description="Eigenes Nginx-Image mit benutzerdefinierten Konfigurationen und statischen Dateien"

# Arbeitsverzeichnis (nur informativ)
WORKDIR /etc/nginx

# Standard-Ports (können beim Start über docker run oder docker-compose gemappt werden)
EXPOSE 80 443

# Kopiere eigene nginx.conf (falls vorhanden)
# Ersetze conf/nginx.conf durch deinen Pfad im Build-Kontext oder entferne, um Standard zu behalten
COPY conf/nginx.conf /etc/nginx/nginx.conf

# Kopiere zusätzliche Server-Konfigurationen
# Beispiel: conf.d/default.conf
COPY conf/conf.d/ /etc/nginx/conf.d/

# Kopiere statische Website-Dateien
COPY html/ /usr/share/nginx/html/

# Kopiere TLS-Zertifikate
COPY certs/ /etc/ssl/certs/

# Setze Berechtigungen (falls nötig)
RUN chmod -R 644 /etc/nginx/nginx.conf || true \
    && chmod -R 644 /etc/nginx/conf.d/* || true \
    && chown -R nginx:nginx /usr/share/nginx/html || true

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- --timeout=2 http://localhost/ || exit 1

# Standardbefehl (gemäß Base-Image)
CMD ["nginx", "-g", "daemon off;"]
~~~

### COPY
- Kopiert eine Datei oder Verzeichnis in das Docker-Image
- Für jeden COPY Befehl wird im Docker-Image ein eigener Layer erzeugt. Kann unnötig viele Layer erzeugen, hat aber auch Vorteile beim docker pull, da hier die einzelnen Layer nur bei bedarf aktualisiert werden.
- Falls nötig die dateien zuerst zu einem tar file zusammen fassen:  ```tar -cvf bundle.tar file1 file2 dir1``` und anschliessen mit 
~~~
COPY bundle.tar /tmp/
RUN tar -xvf /tmp/bundle.tar -C /app && rm /tmp/bundle.tar
~~~
kopieren und im Docker-Image entpacken (in diesem Beispiel werden nur 2 Layer angelegt, einer für COPY und einer für RUN)

### RUN
- Führt einen Befehl im Docker-Image aus
- Für jedes RUN wir ein eigener Layer erzeugt

### HEALTHCHECK
Der HEALTHCHECK im Dockerfile führt in regelmäßigen Abständen einen Befehl im Container aus und liefert Docker einen Gesundheitszustand (healthy/unhealthy/starting). Konkrete Effekte:
- Docker führt das angegebene Kommando periodisch aus (gemäß --interval, --timeout, --start-period, --retries).
- Rückgabewert 0 = healthy, alles andere = unhealthy; bei wiederholtem Fehlschlag geht der Status auf unhealthy.
- docker ps zeigt in der STATUS-Spalte z.B. "Up X (healthy)" oder "Up X (unhealthy)".

## docker-compose.yaml

~~~yaml
services:
  nginx:
    build:
      context: .
      dockerfile: Dockerfile
    image: mein-nginx:latest
    container_name: mein-nginx
    depends_on:
      - mariadb
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    networks:
      - webnet

  mariadb:
    image: mariadb:10.11
    container_name: mariadb
    environment:
      MYSQL_ROOT_PASSWORD: changeme
      MYSQL_DATABASE: appdb
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppassword
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped
    networks:
      - webnet

volumes:
  db_data:

networks:
  webnet:
    driver: bridge
~~~

## environment variables
~~~
environment:
      MYSQL_ROOT_PASSWORD: changeme
      MYSQL_DATABASE: appdb
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppassword
~~~

## volumes

[[Docker/Glossar#Docker Volumes]]

~~~
 volumes:      
    - ./html:/usr/share/nginx/html:ro      
    - ./conf/nginx.conf:/etc/nginx/nginx.conf:ro      
    - ./conf/conf.d:/etc/nginx/conf.d:ro      
    - ./certs:/etc/ssl/certs:ro
~~~

~~~
...
volumes:
  - db_data:/var/lib/mysql
...        
volumes:
  db_data:
...  
~~~

## networks

[[Docker/Glossar#Docker Netzwerk]]

~~~
...
networks:
  - webnet
...
networks:
  webnet:
    driver: bridge
...    
~~~

## secrets

[[Secrets]]

## configs

- Im obigen Beispiel wurde die nginx.conf hat in das neue nginx image gebacken. Hierbei muss jedes mal eine neue Image Datei erzeugt werden, sobald ich an der nginx.conf etwas ändert.
- Eine übliche Variante ist auch, die nginx.conf über das bind mounting vom Host zum Container durchzuschleusen. Bei jeder Änderung an der nginx.conf muss nur noch der Container neu gestartet werden.
- In neueren Version von Docker Compose gibt es auch das configs Objekt. Der Vorteil ist, dass "volume bind mountings" von "configuration" getrennt werden und somit das configs Objekt von mehreren Containern referenziert werden kann.
~~~
services:
  web:
    image: nginx:alpine
    configs:
      - source: nginx_conf
        target: /etc/nginx/nginx.conf

configs:
  nginx_conf:
    file: ./nginx.conf

~~~
