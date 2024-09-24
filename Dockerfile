FROM node:20

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

COPY . . 

RUN npm ci

ENTRYPOINT [ "node", "index.js" ]