---
private: true
date: 2025-01-06
title: Listening ports on docker.fritz.box
image: Linux.png
description: 
tags:
  - SmartHome
---

## Command

~~~
nmap -p- docker.fritz.box
~~~

## Open ports

| Port | Service |
| --- | --- |
| 22/tcp     | SSH |
| 53/tcp     | Pihole    |
| 67/udp     | Pihole    |
| 80/tcp     | Pihole    |
| 1880/tcp   | Nodered    |
| 1883/tcp   | Mosquitto    |
| 2525/tcp   | Smtp2Mqtt    |
| 3000/tcp   | Grafana    |
| 3001/tcp   | WebHook2Mqtt    |
| 3010/tcp   | ArdAudio2RSSFeed    |
| 3100/tcp   | Loki    |
| 3306/tcp   | Keycloak    |
| 8080/tcp   | Nginx    |
| 8081/tcp   | Keycloak    |
| 8086/tcp   | InfluxDB    |
| 8094/tcp   | Telegraf    |
| 8123/tcp   | HomeAssistant    |
| 8125/tcp   | Telegraf    |
| 8443/tcp   | Nginx    |
| 9000/tcp   | Portainer    |
| 9001/tcp   | Mosquitto    |
| 9090/tcp   | Cockit    |
| 10443/tcp  | VaultwardenNginx    |
