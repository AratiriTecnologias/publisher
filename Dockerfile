FROM node:6.9.5-slim

RUN mkdir -p /app/downloads
ADD package.json docker-entrypoint.sh /app/

WORKDIR /app/
RUN npm install
ADD src/ /app/src/
RUN npm run build

ENV DOWNLOADS_LOCATION /app/downloads

ENTRYPOINT ["/app/docker-entrypoint.sh"]
