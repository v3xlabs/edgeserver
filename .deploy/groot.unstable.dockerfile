FROM node:16.9.1

WORKDIR /app

COPY . .

RUN yarn global add pnpm

RUN pnpm install

RUN pnpm turbo run build --filter @edgelabs/groot

WORKDIR /app/apps/groot

CMD ["pnpm", "start"]
