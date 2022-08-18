FROM node:18.6.0

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY tsconfig.json ./
COPY src src

CMD ["yarn", "start"]
