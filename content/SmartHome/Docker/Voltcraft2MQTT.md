---
showOnIndexPage: false
draft: true
date: 2025-01-10
title: Voltcraft2MQTT
image: Image.png
description: Send sensor values from Voltcraft SEM6000 to Home Assistant via MQTT
tags:
  - MQTT
  - HomeAssistant
---

## References

- [Creating a Raspberry Pi service](https://domoticproject.com/creating-raspberry-pi-service/)
- [Using MQTT “Last Will or Testament” with Python](https://medium.com/@kardelenyurtkuran/using-mqtt-last-will-or-testament-with-python-f79e96263b11)
- [MQTT and Python For Beginners -Tutorials](http://www.steves-internet-guide.com/mqtt-python-beginners-course/)
- [Python Thread Safety: Using a Lock and Other Techniques](https://realpython.com/python-thread-lock/)
- [The Importance of MQTT QoS: A Comprehensive Guide](https://takethenotes.com/mqtt-qos/)
- [The Importance of MQTT Persistent Session: A Comprehensive Guide](https://takethenotes.com/mqtt-persistent-session/)

## voltcraft2mqtt.py

~~~python
#!/usr/bin/python3

import time
import json
import sys
import threading
import logging

# Import SEM6000 module
from sem6000 import sem6000 as sem6000Module
from sem6000.message import *
from sem6000 import util

# Import MQTT module
from paho.mqtt import client as mqttClientModule

# Import JSON formatter for logging
from pythonjsonlogger.jsonlogger import JsonFormatter

# Setup logger and set JSON as output format
logger = logging.getLogger(__name__)
logHandler = logging.StreamHandler()
formatter = JsonFormatter(
       "{levelname}{message}", 
       style="{",
       rename_fields={"levelname": "level"})
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# MQTT settings
CLIENT_ID = "voltcraft2mqtt"
BROKER = "docker.fritz.box"
PORT = 1883

#Lock for thread safe oparations on SEM6000 device
Sem6000Lock = threading.Lock()

# Function to connect to MQTT broker
def connectToMqtt():
       # Callback function for MQTT connection
       def on_connect(client, userdata, flags, rc, properties):
              if rc == 0:
                     logger.info("Connected to MQTT Broker!")
              else:
                     logger.error("Failed to connect, return code %d\n", rc)
   
       logger.info("Create MQTT client")
       mqttClient = mqttClientModule.Client(client_id=CLIENT_ID, callback_api_version=mqttClientModule.CallbackAPIVersion.VERSION2)
       # client.username_pw_set(username, password)
       mqttClient.on_connect = on_connect
       mqttClient.will_set("sem6000/openmediavault/available", "offline")
       logger.info("Connecting to MQTT")
       mqttClient.connect(BROKER, PORT)

       return mqttClient

# Publish device availability status to HomeAssistant
def setDeviceInHaAsAvailable(mqttClient: mqttClientModule):
       logger.info("Set device in HomeAssistant as available")
       result = mqttClient.publish("sem6000/openmediavault/available", "online")

# Publish power state OFF to HomeAssistant
def setPowerStateInHaToOff(mqttClient: mqttClientModule):
       logger.info("Set power state in HomeAssistant to OFF")
       result = mqttClient.publish("sem6000/openmediavault/switch/state", "OFF")

# Publish power state ON to HomeAssistant
def setPowerStateInHaToOn(mqttClient: mqttClientModule):
       logger.info("Set power state in HomeAssitant to ON")
       result = mqttClient.publish("sem6000/openmediavault/switch/state", "ON")
      
# Initialize MQTT connection, set initial states and subscribe to command topic
def initialize():
       logger.info("Initializing voltcraft2mqtt")
       mqttClient = connectToMqtt()
       setDeviceInHaAsAvailable(mqttClient)
       setPowerStateInHaToOff(mqttClient)
       logger.info("Subscribe to command topic")
       subscribeToCommandTopic(mqttClient)
       
       return mqttClient

# Send SEM6000 sensor values to HomeAssistant
def sendSem6000SensorValuesToHa(mqttClient: mqttClientModule):
       logger.info("Send SEM6000 sensor values to HomeAssistant")
       deviceAddr = sys.argv[1]

       with Sem6000Lock:
              sem6000Client = sem6000Module.SEM6000(deviceAddr, debug=False)
              response = sem6000Client.request_measurement()
              sem6000Client.disconnect()

       payload = {}

       logger.info(response)
       if response.is_power_active:
              setPowerStateInHaToOn(mqttClient)
              payload["PowerSwitch"] = 1
       else:
              setPowerStateInHaToOff(mqttClient)
              payload["PowerSwitch"] = 0
              
       payload["PowerInMilliWatt"] = response.power_in_milliwatt
       payload["VoltageInVolt"] = response.voltage_in_volt
       payload["CurrentInMilliAmpere"] = response.current_in_milliampere
       payload["ConsumptionInKiloWattPerHour"] = response.total_consumption_in_kilowatt_hour
       
       payloadJson = json.dumps(payload)
       result = mqttClient.publish("sem6000/openmediavault/sensor/values", payloadJson)

# Switch power state of SEM6000 device
def switchPowerState(newSwitchState: str):
       logger.info("Switch power state")
       deviceAddr = sys.argv[1]
       pin = sys.argv[2]

       with Sem6000Lock:
              sem6000Client = sem6000Module.SEM6000(deviceAddr, debug=False)
              sem6000Client.authorize(pin)
              if newSwitchState == "ON":
                     sem6000Client.power_on()
              elif newSwitchState == "OFF":
                     sem6000Client.power_off()
              sem6000Client.disconnect()

# Subscribe to MQTT command topic
def subscribeToCommandTopic(mqttClient: mqttClientModule):
    def on_message(client, userdata, msg):
       switchPowerState(msg.payload.decode())     
       sendSem6000SensorValuesToHa(mqttClient)         
              
    mqttClient.subscribe("sem6000/openmediavault/switch/set")
    mqttClient.on_message = on_message

# Main loop to send sensor values periodically
def run(mqttClient: mqttClientModule):
       logger.info("Start main loop")
       mqttClient.loop_start()

       while True:
              sendSem6000SensorValuesToHa(mqttClient)
              logger.info("Sleep 300s")
              time.sleep(300)

       mqttClient.loop_stop()

if __name__ == '__main__':
       if len(sys.argv) < 1:
              scriptname = sys.argv[0]
              logger.error("Usage:")
              logger.error("\t" + scriptname + " <address> <pin> <command>")
       else:
              mqttClient = initialize()
              run(mqttClient)

~~~

## Setup as service

### Create new user voltcraft2mqtt

~~~bash
sudo useradd -m voltcraft2mqtt
~~~

### voltcraft2mqtt.sh

~~~bash
 ./voltcraft2mqtt.py F0:C7:7F:1C:89:19 0000
~~~

### voltcraft2mqtt as service

#### Copy voltcraft2mqtt.service to

~~~
sudo cp voltcraft2mqtt.service /lib/systemd/system/
~~~

#### Start service

~~~
sudo systemctl start voltcraft2mqtt.service
~~~

#### Status of  service

~~~
pi@docker:~ $ sudo systemctl status voltcraft2mqtt.service
● voltcraft2mqtt.service - Gateway between Sem6000 and MQTT
   Loaded: loaded (/lib/systemd/system/voltcraft2mqtt.service; disabled; vendor preset: enabled)
   Active: active (running) since Sun 2025-01-12 11:03:08 CET; 3min 5s ago
 Main PID: 18790 (bash)
    Tasks: 3 (limit: 4915)
   CGroup: /system.slice/voltcraft2mqtt.service
           ├─18790 /bin/bash /home/voltcraft2mqtt/voltcraft2mqtt.sh
           └─18791 /usr/bin/python3 ./voltcraft2mqtt.py F0:C7:7F:1C:89:19 0000

Jan 12 11:03:08 docker bash[18790]: {"message": "Start main loop", "level": "INFO"}
Jan 12 11:03:08 docker bash[18790]: {"message": "Send SEM6000 sensor values to HomeAssistant", "level": "INFO"}
Jan 12 11:03:08 docker bash[18790]: {"message": "Connected to MQTT Broker!", "level": "INFO"}
Jan 12 11:03:08 docker bash[18790]: {"message": "Switch power state", "level": "INFO"}
Jan 12 11:03:11 docker bash[18790]: {"message": "MeasurementRequestedNotification(is_power_active=False, power_in_milliwatt=0, voltage_in_volt=230, current_in_milliampere=
Jan 12 11:03:11 docker bash[18790]: {"message": "Set power state in HomeAssistant to OFF", "level": "INFO"}
Jan 12 11:03:11 docker bash[18790]: {"message": "Sleep 600s", "level": "INFO"}
Jan 12 11:03:14 docker bash[18790]: {"message": "Send SEM6000 sensor values to HomeAssistant", "level": "INFO"}
Jan 12 11:03:16 docker bash[18790]: {"message": "MeasurementRequestedNotification(is_power_active=False, power_in_milliwatt=0, voltage_in_volt=230, current_in_milliampere=
Jan 12 11:03:16 docker bash[18790]: {"message": "Set power state in HomeAssistant to OFF", "level": "INFO"}
~~~

#### Check logs for service

~~~
pi@docker:~ $ journalctl -u voltcraft2mqtt.service
-- Logs begin at Fri 2025-01-03 20:10:16 CET, end at Sun 2025-01-12 11:07:00 CET. --
Jan 08 20:35:35 docker systemd[1]: Started Gateway between Sem6000 and MQTT.
Jan 08 20:35:35 docker bash[12859]: {"message": "Initializing voltcraft2mqtt", "level": "INFO"}
Jan 08 20:35:35 docker bash[12859]: {"message": "Create MQTT client", "level": "INFO"}
~~~

#### voltcraft2mqtt.service

~~~
[Unit]
Description=Gateway between Sem6000 and MQTT
After=network-online.target

[Service]
ExecStart=/bin/bash /home/voltcraft2mqtt/voltcraft2mqtt.sh
WorkingDirectory=/home/voltcraft2mqtt
StandardOutput=inherit
StandardError=inherit
Restart=always
User=voltcraft2mqtt

[Install]
WantedBy=multi-user.target
~~~

### homeassistant.mqtt.yaml

~~~yaml
# Add switch to Home Assistant
- switch:
      unique_id: sem6000_openmediavault_switch
      name: "MQTT-OpenMediaVault Switch"
      # state_topic: state of sem6000; power on/off
      state_topic: "sem6000/openmediavault/switch/state"
      # command_topic: switch sem600 to on/off
      command_topic: "sem6000/openmediavault/switch/set"
      # availability_topic: is sem6000 device available
      availability:
        - topic: "sem6000/openmediavault/available"
      optimistic: false
      qos: 0
      retain: true
# Add sensors for SEM6000 to Home Assistant
# Each of the senor values must have a name and a unique_id
- sensor:
    - name: "MQTT-OpenMediaVault PowerSwitch"
      unique_id: sem6000_openmediavault_powerswitch_on_off
      # state_topic: sensor values of sem6000; here we use a JSON payload
      state_topic: "sem6000/openmediavault/sensor/values"
      value_template: "{{ value_json.PowerSwitch }}"
      unit_of_measurement: ""
      availability:
        - topic: "sem6000/openmediavault/available"
    - name: "MQTT-OpenMediaVault PowerInMilliWatt"
      unique_id: sem6000_openmediavault_power_in_milli_watt
      device_class: power
      # state_topic: sensor values of sem6000; here we use a JSON payload
      state_topic: "sem6000/openmediavault/sensor/values"
      value_template: "{{ value_json.PowerInMilliWatt }}"
      unit_of_measurement: "mW"
      availability:
        - topic: "sem6000/openmediavault/available"
    - name: "MQTT-OpenMediaVault VotageinVolt"
      unique_id: sem6000_openmediavault_voltage_in_volt
      device_class: voltage
      # state_topic: sensor values of sem6000; here we use a JSON payload
      state_topic: "sem6000/openmediavault/sensor/values"
      value_template: "{{ value_json.VoltageInVolt }}"
      unit_of_measurement: "V"
      availability:
        - topic: "sem6000/openmediavault/available"
    - name: "MQTT-OpenMediaVault CurrentInMilliAmpere"
      unique_id: sem6000_openmediavault_current_in_milli_ampere
      device_class: current
      # state_topic: sensor values of sem6000; here we use a JSON payload
      state_topic: "sem6000/openmediavault/sensor/values"
      value_template: "{{ value_json.CurrentInMilliAmpere }}"
      unit_of_measurement: "mA"
      availability:
        - topic: "sem6000/openmediavault/available"
    - name: "MQTT-OpenMediaVault ConsumptionInKiloWattPerHour"
      unique_id: sem6000_openmediavault_consumption_in_kw_per_hour
      device_class: energy
      # state_topic: sensor values of sem6000; here we use a JSON payload
      state_topic: "sem6000/openmediavault/sensor/values"
      value_template: "{{ value_json.ConsumptionInKiloWattPerHour }}"
      unit_of_measurement: "Wh"
      availability:
        - topic: "sem6000/openmediavault/available"

~~~

## Logs in Loki

![[LogsInLoki.png]]
