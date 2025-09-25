---
showOnIndexPage: false
date: 2024-11-24
title: Send SNMP statistics via Telegraf to InfluxDB
image: Telegraf.png
description: Take statistics from Netgear devices with SNMP and Telegraf and forward them to InfluxDB. The statistics are also written to different buckets
tags:
  - Telegraf
  - SNMP
---

## References

- [Grafana: Monitor SNMP devices with Telegraf and InfluxDB](https://www.dev-eth0.de/2016/12/06/grafana_snmp/)

## Konfiguration

### Bucket Docker

~~~
[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Docker"
  namedrop = ["NetgearWohnzimmer", "NetgearKeller", "Buero", "Router"]
~~~

By default all Telegraf statistics are sent to bucket Docker, except name (measurements) NetgearWohnzimmer, NetgearKeller, Buero, Router

![[BucketDocker.png]]

### Bucket Fritzbox

~~~
[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Fritzbox"
  namepass = ["Buero", "Router"]
~~~

All measurements for Buero and Router are written to bucket Fritzbox

![[BucketFritzbox.png]]

### Bucket Snmp

~~~
[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Snmp"
  namepass = ["NetgearWohnzimmer","NetgearKeller"]
~~~

![[BucketSnmp.png]]

## telegraf.conf

~~~
# Telegraf Configuration
#
# Global tags can be specified here in key="value" format.
[global_tags]

# Configuration for telegraf agent
[agent]
  interval = "60s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "60s"
  flush_jitter = "0s"
  precision = ""
  hostname = "docker.fritz.box"
  omit_hostname = false

[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Docker"
  namedrop = ["NetgearWohnzimmer", "NetgearKeller", "Buero", "Router"]

[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false

[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs", "iso9660", "overlay", "aufs", "squashfs"]

[[inputs.diskio]]

[[inputs.kernel]]

[[inputs.mem]]

[[inputs.processes]]

[[inputs.swap]]

[[inputs.system]]

[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Fritzbox"
  namepass = ["Buero", "Router"]

[[inputs.socket_listener]]
  service_address = "tcp://:8094"
  data_format = "influx"

[[inputs.file]]
  files = ["/sys/class/thermal/thermal_zone0/temp"]
  name_override = "cpu_temperature"
  data_format = "value"
  data_type = "integer"

[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Snmp"
  namepass = ["NetgearWohnzimmer","NetgearKeller"]

[[inputs.snmp]]
  agents = [ "netgearwohnzimmer.fritz.box:161" ]
  version = 2
  community = "geheim"
  name = "NetgearWohnzimmer"
  name_override = "NetgearWohnzimmer"

 [[inputs.snmp.field]]
    name = "hostname"
    oid = "SNMPv2-MIB::sysName.0"
    is_tag = true

  [[inputs.snmp.table]]
    name = "snmp"
    inherit_tags = [ "hostname" ]
    oid = "IF-MIB::ifXTable"

    [[inputs.snmp.table.field]]
      name = "ifName"
      oid = "IF-MIB::ifName"
      is_tag = true

[[inputs.snmp]]
  agents = [ "netgearkeller.fritz.box:161" ]
  version = 2
  community = "geheim"
  name = "NetgearKeller"
  name_override = "NetgearKeller"

 [[inputs.snmp.field]]
    name = "hostname"
    oid = "SNMPv2-MIB::sysName.0"
    is_tag = true

  [[inputs.snmp.table]]
    name = "snmp"
    inherit_tags = [ "hostname" ]
    oid = "IF-MIB::ifXTable"

    [[inputs.snmp.table.field]]
      name = "ifName"
      oid = "IF-MIB::ifName"
      is_tag = true
~~~
