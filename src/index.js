'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import os from 'os';

import * as admin from "firebase-admin";

import logger from './logger';

// Constants
const PORT = 8080;

// App
const app = express();
app.use(bodyParser.json({limit: '50mb', type:'application/json'}));

const serviceAccount = require(process.env.ADMIN_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const db = admin.database();

var gcloud = require('google-cloud')({
  projectId: `${process.env.GCLOUD_PROJECT_ID}`,
  // Specify a path to a keyfile.
  keyFilename: `${process.env.SERVICE_ACCOUNT}`
});
var storage = gcloud.storage();

const bucket = storage.bucket(process.env.STORAGE_BUCKET);

app.post('/publish', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  const { path, method, data } = req.body;
  logger.debug(req.body);
  const ref = db.ref(path);
  switch (method) {
    case "set": {
      const response = ref.set(data).then(snapshot => {
        logger.debug(snapshot.path);
      }).catch(err => {
        logger.debug(err);
      });
      break;
    }
    case "push": {
      const response = ref.push(data).then(snapshot => {
        logger.debug(snapshot.path);
      }).catch(err => {
        logger.debug(err);
      });
      break;
    }
  }
  res.json({
    "published": ":)"
  });
});

app.post('/upload', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  logger.debug(req.body);
  const { filename } = req.body;

  const fileLocation = `${process.env.DOWNLOADS_LOCATION}/${filename}`;

  bucket.upload(fileLocation, function (err, file) {
    if (err) {
      logger.debug(`error: ${JSON.stringify(err)}`);
      logger.debug(`ERROR on upload file to google cloud`);
      logger.debug(err);

      res.status(500);
      res.json({"message": "file not uploaded", "error": err});
    }

    file.makePublic(function (err) {
      if (err) {
        logger.debug(`error: ${JSON.stringify(err)}`);
        logger.debug(err);

        res.status(500);
        res.json({"message": "is not public", "error": err});
      }

      const {mediaLink} = file.metadata;
      res.json({
        mediaLink: mediaLink
      });
    });

  });
});

app.get('/healthz', function (req, res) {
  // Status OK = 200 // RFC 7231, 6.3.1
  res.status(200).json({
    "status": "alive",
    "hostname": os.hostname()
  });
});

app.listen(PORT);