---
showOnIndexPage: true
date: 2025-10-17
title: Add Seq for Road Project
image: Serilog.png
description: Write log entries also Seq
tags:
  - Dotnet
  - Docker
---
## Add Serilog.Sinks.Seq to Project

![[Add-Serilog.Sinks.Seq-to-Project.png]]

## Add Seq as additional "WriteTo"

~~~json
{
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File", "Serilog.Sinks.Seq" ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Information",
        "Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware": "Information",
        "Serilog.HttpClient": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "./logs/Road.API_.json",
          "rollingInterval": "Day",
          "formatter": "Serilog.Formatting.Compact.CompactJsonFormatter, Serilog.Formatting.Compact"
        }
      },
      {
        "Name": "Seq",
        "Args": {
          "serverUrl":  "http://road.seq:5341"
        }
      }
    ],
    "Enrich": [
      "FromLogContext",
      {
        "Name": "WithCorrelationId",
        "Args": {
          "headerName": "x-correlation-id",
          "addValueIfHeaderAbsence": true
        }
      }
    ],
    "Properties": {
      "Application": "Road.API"
    }
  },
  "AllowedHosts": "*"
}
~~~
## Create docker-compose to start also Seq as container

~~~yaml
services:
   road.api:
      image: roadapi
      container_name: roadapi
      ports:
         - 8080:8080
   road.seq:
      image: datalust/seq:latest
      container_name: roadseq
      environment:
         - ACCEPT_EULA=Y
         - SEQ_FIRSTRUN_ADMINUSERNAME=admin
         - SEQ_FIRSTRUN_ADMINPASSWORD=password
      ports:
         - 5341:5341
         - 8081:80
~~~

- Port 5341 is used for ingesting; 
- Port 8081 is used for Seq web frontend
- There is no persistent volume, after the container is destroyed the log entries are also deleted.
- Port 8080 is web frontend for RoadApi project

## Seq WebFrontend

![[Seq01.png]]

![[Seq02.png]]

![[Seq03.png]]
