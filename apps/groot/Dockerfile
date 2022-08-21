FROM node:18.6.0

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY dist src

CMD ["yarn", "node ./src/index.js"]
