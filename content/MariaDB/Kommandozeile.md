---
showOnIndexPage: true
date: 2026-06-02
title: MariaDB Kommandozeile
image: MariaDB.png
description:
tags:
  - MariaDB
---

## Passwort in Umgebungsvariable

~~~
PS C:\Users\fleishor> $env:MYSQL_PWD = "***"
PS C:\Users\fleishor> mariadb -hlocalhost -P3306 --skip-ssl -uroot MyMariaDB -e "select version();"
+--------------------------+
| version()                |
+--------------------------+
| 10.11.15-MariaDB-ubu2204 |
+--------------------------+
~~~


## Ausgabe in Variable speichern

~~~
PS C:\Users\fleishor> $result = mariadb -hlocalhost -P3306 --skip-ssl -uroot MyMariaDB -e "select version();"
PS C:\Users\fleishor> Write-Host "Ausgabe: $result"
Ausgabe: version() 10.11.15-MariaDB-ubu2204
~~~

## Nur Werte zurückgeben

~~~
PS C:\Users\fleishor> mariadb -hlocalhost -P3306 --skip-ssl --batch --skip-column-names -uroot MyMariaDB -e "select version();"
10.11.15-MariaDB-ubu2204
~~~


## SQL statement aus einer Datei laden

~~~
PS C:\Users\fleishor> Get-Content .\sqlscript.sql | mariadb -hlocalhost -P3306 --skip-ssl -uroot MyMariaDB
version()
10.11.15-MariaDB-ubu2204
PS C:\Users\fleishor> Write-Host "ExitCode: $LASTEXITCODE"
ExitCode: 0
~~~

## XML Ausgabe

~~~
PS C:\Users\fleishor> Get-Content .\sqlscript.sql | mariadb -hlocalhost -P13306 --skip-ssl --xml -uroot MyMariaDB
~~~


