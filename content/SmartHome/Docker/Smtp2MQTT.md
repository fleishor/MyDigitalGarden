---
showOnIndexPage: true
date: 2023-03-04
title: Smtp2MQTT
description: Save Mail in Filesystem and forward notification with HTTP reference via MQTT
tags:
  - Docker
  - NodeJS
  - ExpressJS
  - MQTT
  - Typescript
  - Dockerfile
---

## References

- <https://nodemailer.com/extras/smtp-server/>
- <https://github.com/trentm/node-bunyan>
- <http://www.steves-internet-guide.com/using-node-mqtt-client/>
- <https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>

## File tsconfig.json

~~~json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["**/*.ts"],
  "exclude": ["dist"]
}
~~~

## File  package.json

~~~json
{
  "name": "smtp2mqtt",
  "version": "1.0.0",
  "description": "",
  "main": "./dist/smtp2mqtt.js",
  "scripts": {
    "dev": "tsx --watch src/smtp2mqtt.ts",
    "start": "node dist/smtp2mqtt.js",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "buildImage": "docker build . -t smtp2mqtt:20260402"
  },
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@tsconfig/node24": "^24.0.4",
    "@types/express": "^5.0.6",
    "@types/mailparser": "^3.4.6",
    "@types/node": "^25.5.0",
    "@types/smtp-server": "^3.5.12",
    "eslint": "^10.1.0",
    "eslint-plugin-perfectionist": "^5.7.0",
    "mqtt": "^5.15.1",
    "prettier": "^3.8.1",
    "tsx": "^4.21.0",
    "typescript": "^6.0.2",
    "typescript-eslint": "^8.58.0"
  },
  "dependencies": {
    "@types/bunyan": "^1.8.11",
    "@types/nodemailer": "^7.0.11",
    "bunyan": "^1.8.15",
    "mailparser": "^3.9.6",
    "smtp-server": "^3.18.3"
  }
}
~~~

## File eslint.config.js

~~~javascript
// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";

export default tseslint.config(
  {
    ignores: ["**/*.js"],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  perfectionist.configs["recommended-natural"],
);
~~~

## Dockerfile

~~~yaml
FROM node:25-alpine

# Create app directory
WORKDIR /smtp2mqtt

# Install app dependencies
COPY package.json tsconfig.json eslint.config.js ./
RUN npm install

# Copy app source code
COPY ./src/smtp2mqtt.ts ./src/

# build application
RUN npm run build

EXPOSE 2525
CMD [ "node", "/smtp2mqtt/dist/smtp2mqtt.js" ]
~~~

## Generate Javascript from Typescript

~~~bash
npm run build
~~~

## Run smtp2mqtt.js

~~~bash
npm run smtp2mqtt
~~~

## Create Docker image

~~~bash
npm run buildImage
~~~

## Source code smtp2mqtt.ts

~~~typescript
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import bunyan from "bunyan";
import fs from "fs";
import { simpleParser } from "mailparser";
import mqtt from "mqtt";
import { SMTPServer } from "smtp-server";

function parsedMailInfoSerializer(parsedMailInfo: { from: string; messageId: string; }) {
   return {
      from: parsedMailInfo.from,
      messageId: parsedMailInfo.messageId,
   };
}

function sessionInfoSerializer(sessionInfo: { clientHostname: string; id: string; remoteAddress: string; transaction: string; }) {
   return {
      clientHostname: sessionInfo.clientHostname,
      id: sessionInfo.id,
      remoteAddress: sessionInfo.remoteAddress,
      transaction: sessionInfo.transaction,
   };
}

const logger = bunyan.createLogger({
   level: "debug",
   name: "smtp2mqtt",
   serializers: {
      parsedMailInfo: parsedMailInfoSerializer,
      sessionInfo: sessionInfoSerializer, 
   },
});

const smtpStorage = "/storage";
const smtpServerPort = 2525;
const smtpUserName = "pi@fleishor.localdomain";
const smtpPassword = "pi";
const mqttBroker = "mqtt://docker.fritz.box";
const mqttClientId = "smtp2mqtt";

// Connect to MQTT Broker
let mqttClientConnected = false;
const mqttClient = mqtt.connect(mqttBroker, { clientId: mqttClientId });

const smtpServer = new SMTPServer({
   // Disable STARTTLS to allow authentication in clear text mode
   disabledCommands: ["STARTTLS"],
   logger: logger,
   onAuth(auth, session, callback) {
      logger.info({ sessionInfo: session }, "SMTPServer.onAuth");
      if (auth.username !== smtpUserName && auth.password !== smtpPassword) {
         callback(new Error("Invalid username/password:" + auth.username + "/" + auth.password));
      }
      callback(null, { user: 123456 }); // where 123 is the user id or similar property
   },
   onClose(session) {
      logger.info({ sessionInfo: session }, "SMTPServer.onClose from " + session.clientHostname);
   },
   onConnect(session, callback) {
      logger.info({ sessionInfo: session }, "SMTPServer.onConnect from " + session.clientHostname);
      callback();
   },
   onData(stream, session, callback) {
      // Receive email
      logger.info({ sessionInfo: session }, "SMTPServer.onData from " + session.clientHostname);
      simpleParser(stream, {}, (err, parsedMail) => {
         // Parse email
         logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: start");
         if (err) {
            logger.error({ sessionInfo: session }, "SMTPServer.onData.simpleParser: " + err);
         }

         logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: parsed email with subject: " + parsedMail.subject);

         // Parsed mail without attachments
         const parsedMailWithoutAttachments = Object.assign({}, parsedMail);
         parsedMailWithoutAttachments.attachments = [];
         parsedMailWithoutAttachments.html = parsedMailWithoutAttachments.html || ( parsedMailWithoutAttachments.textAsHtml ?? false );

         // Create directory for writing mail
         logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: make directory for session.id" + session.id);
         const dateNowUtc = new Date().toISOString();
         const mailDirectory = dateNowUtc + "_" + session.id;
         fs.mkdirSync(mailDirectory);

         // Write email as JSON
         logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: write JSON file");
         fs.writeFileSync(mailDirectory + "/" + session.id + ".json", JSON.stringify(parsedMailWithoutAttachments));

         // Write eamil as HTML
         logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: write HTML file");
         fs.writeFileSync(mailDirectory + "/" + session.id + ".html", parsedMailWithoutAttachments.html === false ? "" : parsedMailWithoutAttachments.html);

         // Write Attachments
         parsedMail.attachments.forEach((attachment) => {
            logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: write attachment: " + attachment.filename);
            fs.writeFileSync(mailDirectory + "/" + attachment.filename, attachment.content);
         });

         // Publish sessionId via MQTT
         if (mqttClientConnected) {
            const mqttPrefix = "smtp";
            let mqttDevice = "UnknownDevice";
            if (!parsedMail.from) {
               logger.warn({ parsedMailInfo: parsedMail, sessionInfo: session }, "Email has no 'from' address");
            }
            else 
            {
               mqttDevice = parsedMail.from.value["0"].name;
            }
            if (!mqttDevice) {
               mqttDevice = session.clientHostname.replace(".fritz.box", "");
            }

            let mqttSubDevice = mqttDevice;
            const mailSubject = parsedMailWithoutAttachments.subject ?? "No Subject";
            if (mailSubject.includes("OpenMediaVault")) {
               mqttSubDevice = "OpenMediaVault";
            } else if (mailSubject.includes("Buero")) {
               mqttSubDevice = "Buero";
            } else if (mailSubject.includes("Gefriertruhe")) {
               mqttSubDevice = "Gefriertruhe";
            } else if (mailSubject.includes("Kueche")) {
               mqttSubDevice = "Kueche";
            } else if (mailSubject.includes("Wintergarten")) {
               mqttSubDevice = "Wintergarten";
            }

            const topic = mqttPrefix + "/" + mqttDevice + "/" + mqttSubDevice;
            const mqttPayload = JSON.stringify({
               clientHostname: session.clientHostname,
               mailDirectory: mailDirectory,
               mqttDevice: mqttDevice,
               mqttPrefix: mqttPrefix,
               mqttSubDevice: mqttSubDevice,
               sessionId: session.id,
               topic: topic,
            });
            logger.info({ mqttPayload: mqttPayload, topic: topic }, "Publish to MQTT with topic " + topic);
            mqttClient.publish(topic, mqttPayload);
         }

         logger.info({ parsedMailInfo: parsedMail, sessionInfo: session }, "SMTPServer.onData.simpleParser: done");
         callback();
      });

      logger.info({ sessionInfo: session }, "SMTPServer.onData: done");
   },
});

smtpServer.on("error", (err) => {
   logger.error("Error %s", err.message);
});

process.chdir(smtpStorage);

mqttClient.on("connect", () => {
   mqttClientConnected = true;
   logger.info("Connected to MQTT Broker");
});

mqttClient.on("error", function (error) {
   logger.error("Error connecting to MQTT Broker, Error:" + error);
   process.exit(1);
});

logger.info({}, "Startup SMTP Server");
smtpServer.listen(smtpServerPort, "0.0.0.0");
~~~

## Create new user smtp2mqtt

~~~bash
sudo useradd -m smtp2mqtt
~~~

## Add user smtp2mqtt to docker group

~~~bash
sudo usermod -aG docker smtp2mqtt
~~~

## Login as user smtp2mqtt

~~~bash
sudo -u smtp2mqtt -i
~~~

## Get uid and gid for user smtp2mqtt

~~~bash
smtp2mqtt@docker:~ $ id
uid=1014(smtp2mqtt) gid=1014(smtp2mqtt) groups=1014(smtp2mqtt),995(docker)
~~~

## Create directories for smtp2mqtt

~~~bash
mkdir storage
~~~

## File docker-compose.yaml

~~~yaml
version: "3.5"

services:
  smtp2mqtt:
    image: smtp2mqtt:20260402
    container_name: smtp2mqtt
    user: 1009:995
    volumes:
      - /home/smtp2mqtt/storage:/storage:rw
    ports:
      - "2525:2525"
    restart: always
    networks:
        - smarthome
        
networks:
    smarthome:
        external: true
        name: "smarthome"
~~~
