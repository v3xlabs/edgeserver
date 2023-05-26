FROM node:20-buster as builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN pnpm install --filter=@edgelabs/api...
RUN pnpm --filter=@edgelabs/api... build
RUN pnpm --filter=@edgelabs/api deploy service_api

FROM node:20-buster

WORKDIR /app

COPY --from=builder /app/service_api .

CMD ["node", "dist/index.js"]
