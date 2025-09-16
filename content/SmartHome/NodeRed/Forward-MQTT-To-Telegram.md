---
date: 2023-03-05
title: Forward MQTT message to telegram
image: MqttTelegram.png
description: Forward MQTT messages from Smtp2MQTT and Webhook2MQTT to Telegram
tags:
   - Docker
   - Raspberry Pi
   - NodeRed
   - Telegram
---

## Workflow for sending MQTT to Telegram

![WorkFlow](01_Workflow.png)

## MQTT node

![WorkFlow](02-Mqtt-Node.png)

## MQTT configuration

![WorkFlow](03-Mqtt-Broker-Node-Configuration.png)

## Convert MQTT payload from string to Javascript object

![WorkFlow](04-Convert-Payload-To-JSON.png)

## Switch depending on topic

![WorkFlow](05-Switch-mqttType.png)

## Create Telegram message for SMTP

![WorkFlow](06-Create-Telegram-Message-Smtp.png)

## Create Telegram message for WebHook

![WorkFlow](07-Create-Telegram-Message-Webhook.png)

## Send Telegram message to SmartHomeNotification channel

![WorkFlow](08-Send-To-SmartHomeNotificaton-Channel.png)

## Write log message to NodeRed console and therefore to Loki

![WorkFlow](09-Notification-Sent-To-Telegram.png)
![WorkFlow](10-Mqtt.png)
