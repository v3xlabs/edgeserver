FROM node:latest

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY tsconfig.json ./
COPY src src

CMD ["yarn", "start"]