FROM node:20-buster

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN pnpm install

WORKDIR /app/services/api

RUN pnpm install

CMD ["pnpm", "run", "dev"]
