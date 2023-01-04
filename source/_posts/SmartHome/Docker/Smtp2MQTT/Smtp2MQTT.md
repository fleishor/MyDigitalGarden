---
date: 2023-01-01 22:54:05
title: Smtp2MQTT
description: Save Mail in Filesystem and forward notification with reference via MQTT
tags: 
- Docker 
- NodeJS
- ExpressJS
- MQTT
- Typescript
- Dockerfile
---

# References
<https://nodemailer.com/extras/smtp-server/>
<https://github.com/trentm/node-bunyan>
<http://www.steves-internet-guide.com/using-node-mqtt-client/>
<https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>


# File tsconfig.json
~~~json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist"
  },
  "lib": ["es2015"]
}
~~~

# File  package.json
~~~json
{
  "name": "smtp2mqtt",
  "version": "1.0.0",
  "description": "",
  "main": "./dist/smtp2mqtt.js",
  "scripts": {
    "buildImage": "docker build . -t smtp2mqtt",
    "build": "npx tsc",
    "smtp2mqtt": "node ./dist/smtp2mqtt.js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/express": "^4.17.15",
    "typescript": "^4.9.4"
  },
  "dependencies": {
    "@types/bunyan": "^1.8.8",
    "@types/nodemailer": "^6.4.7",
    "bunyan": "^1.8.15",
    "mailparser": "^3.1.0",
    "mqtt": "^4.3.7",
    "smtp-server": "^3.8.0"
  }
}
~~~

# Dockerfile
~~~yaml
FROM node:19.3.0-alpine3.16

# Create app directory
WORKDIR /smtp2mqtt

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./dist/smtp2mqtt.js .

EXPOSE 3001

CMD [ "node", "/smtp2mqtt/smtp2mqtt.js" ]
~~~

# Generate Javascript from Typescript
~~~bash
npm run build
~~~

# Run smtp2mqtt.js
~~~bash
npm run smtp2mqtt
~~~

# Create Docker image
~~~bash
npm run buildImage
~~~

# Source code smtp2mqtt.ts
~~~typescript
const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
import mqtt from "mqtt";
import fs from "fs";
import bunyan from "bunyan";
 

function mapToObj(inputMap) {
   let obj = {};
   inputMap.forEach(function(value, key){
       obj[key] = value
   });

   return obj;
}

function sessionInfoSerializer(sessionInfo) {
   return {
      id: sessionInfo.id,
      remoteAddress : sessionInfo.remoteAddress,
      clientHostname : sessionInfo.clientHostname,
      transaction : sessionInfo.transaction
   };
}

function parsedMailInfoSerializer(parsedMailInfo) {
   return {
      messageId: parsedMailInfo.messageId,
      from: parsedMailInfo.from,
   };
}

var logger = bunyan.createLogger({
   name: "smtp2mqtt",
   level: "debug",
   serializers: {
      sessionInfo: sessionInfoSerializer,
      parsedMailInfo: parsedMailInfoSerializer
   }
});

const smtpStorage = "/storage"
const smtpServerPort = 2525;
const smtpUserName = "pi@fleishor.localdomain";
const smtpPassword = "pi";
const mqttBroker = "mqtt://docker.fritz.box";
const mqttClientId = "smtp2mqtt";

// Connect to MQTT Broker
let mqttClientConnected = false;
const mqttClient = mqtt.connect(mqttBroker, { clientId: mqttClientId });

const smtpServer = new SMTPServer({
   // disable STARTTLS to allow authentication in clear text mode
   disabledCommands: ["STARTTLS"],
   logger: logger,
   onConnect(session, callback) {
      logger.info({sessionInfo: session}, "SMTPServer.onConnect from " + session.clientHostname);
      return callback();
   },
   onClose(session) {
      logger.info({sessionInfo: session}, "SMTPServer.onClose from " + session.clientHostname);
   },
   onData(stream, session, callback) {
      logger.info({sessionInfo: session}, "SMTPServer.onData from " + session.clientHostname);
      simpleParser(stream, {}, (err, parsedMail) => {
         logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: start");
         if (err)
         {
            logger.error({sessionInfo: session}, "SMTPServer.onData.simpleParser: " + err);
         }

         logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: parsed email with subject: " + parsedMail.subject);
         var parsedWithoutAttachments = Object.assign({}, parsedMail);;
         delete parsedWithoutAttachments.attachments;
         parsedWithoutAttachments.headers = mapToObj(parsedMail.headers);
         if (!parsedWithoutAttachments.html)
         {
            logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: replace html with testAsHtml");
            parsedWithoutAttachments.html = parsedWithoutAttachments.textAsHtml;
         }
         logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: make directory for session.id" + session.id);
         fs.mkdirSync(session.id);
         logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: write JSON file");
         fs.writeFileSync(session.id + "/" + session.id + ".json", JSON.stringify(parsedWithoutAttachments));
         logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: write HTML file");
         fs.writeFileSync(session.id + "/" + session.id + ".html", parsedWithoutAttachments.html);
         parsedMail.attachments.forEach(attachment => {
            logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: write attachment: " + attachment.filename);
            fs.writeFileSync(session.id + "/" + attachment.filename, attachment.content);
         });

         // publish sessionId via MQTT
         if (mqttClientConnected) {
            let topic = "/" + session.clientHostname;
            let playload = JSON.stringify({topic: topic, sessionId: session.id});
            logger.info({topic: topic, payload: playload }, "Publish to MQTT with topic " + topic);
            mqttClient.publish(topic, JSON.stringify(playload));
         }

         logger.info({sessionInfo: session, parsedMailInfo: parsedMail}, "SMTPServer.onData.simpleParser: done");
         callback();
      });

      logger.info({sessionInfo: session}, "SMTPServer.onData: done");
   },

   onAuth(auth, session, callback) {
      logger.info({sessionInfo: session}, "SMTPServer.onAuth");
      if (auth.username !== smtpUserName && auth.password !== smtpPassword) {
         return callback(new Error("Invalid username/password:" + auth.username + "/" + auth.password));
      }
      callback(null, { user: 123456 }); // where 123 is the user id or similar property
   }
});

  

smtpServer.on("error", err => {
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

# Create new user smtp2mqtt
~~~bash
sudo useradd -m smtp2mqtt
~~~

# Add user smtp2mqtt to docker group
~~~bash
sudo usermod -aG docker smtp2mqtt
~~~

# Login as user smtp2mqtt
~~~bash
sudo -u smtp2mqtt -i
~~~

# Get uid and gid for user smtp2mqtt
~~~bash
smtp2mqtt@docker:~ $ id
uid=1014(smtp2mqtt) gid=1014(smtp2mqtt) groups=1014(smtp2mqtt),995(docker)
~~~

# Create directories for smtp2mqtt

~~~bash
mkdir storage
~~~

# File docker-compose.yaml
~~~yaml
version: "3.5"

services:
  smtp2mqtt:
    image: smtp2mqtt:latest
    container_name: smtp2mqtt
    user: 1009:995
    volumes:
      - /home/smtp2mqtt/storage:/storage:rw
    ports:
      - "2525:2525"
    restart: always
    networks:
        - influxdb2

networks:
    influxdb2:
        external: true
        name: "influxdb2"
~~~
