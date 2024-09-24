FROM node:20

COPY . . 

RUN npm install

ENV NODE_ENV=production
ENTRYPOINT [ "node", "index.js" ]