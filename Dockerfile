# Build Stage
FROM node:14-alpine3.11 as build
LABEL app="openap-inventory"

# Install chrome depedencies
RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      git \
      tini \
      #chromium \
      #nss \
      #freetype \
      #harfbuzz \
      #ttf-freefont \
      curl

ARG TAIKO_SKIP_CHROMIUM_DOWNLOAD=true
ARG TAIKO_BROWSER_PATH=/usr/bin/chromium-browser
ARG IS_CI=true
ARG NODE_ENV=test

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run generate-types
RUN npm run lint
# NEED BUILD ARGS IN JARVIS TO GET DB ENV VARS
#RUN npm run test:specs

ARG NODE_ENV=production
RUN npx next telemetry disable
# RUN npm run prepare:pems
RUN npm run build

RUN mkdir /export
RUN mv .next /export/
RUN mv db /export/
RUN mv public /export/
RUN mv node_modules /export/
RUN mv package.json /export/package.json
RUN mv tsconfig.json /export/tsconfig.json
RUN mv next.config.js /export/next.config.js
RUN mv deployment/start.sh /export/start.sh

# Deployment Stage
FROM node:14-alpine3.11

COPY --from=build /export/ .
RUN chmod +x ./start.sh

RUN apk add bash

ENV PORT 3000
EXPOSE 3000

ENTRYPOINT ./start.sh
