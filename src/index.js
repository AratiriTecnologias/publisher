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

const sendResponse = (res) => {
  return (data) => {
    // res.sendStatus(200);
    logger.debug(`sendResponse: ${JSON.stringify(data)}`);
    res.json(data);
  }
}

const sendError = (res) => {
  return (error) => {
    res.status(500);
    logger.debug(`sendError: ${JSON.stringify(error)}`);
    res.json({
      error: error
    });
  }
}

app.post('/publish', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  const { path, method, data } = req.params;
  logger.debug(req.params);
  const ref = db.ref(path);
  switch (method) {
    case "set": 
      const response = db.set(data);
      logger.debug(response);
      break;
    }
    case "push": {
      const response = db.push(data);
      logger.debug(response);
      break;
    }
  }
  res.json({
    "published": ":)"
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