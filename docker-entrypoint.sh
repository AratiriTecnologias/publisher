#!/bin/sh

if [ "${NODE_ENV}" = "development" ]; then
  npm start
else
  npm run serve
fi