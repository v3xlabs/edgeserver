FROM node:18.6.0

WORKDIR /app

COPY ./edgelabs*.tgz ./

RUN tar zxvf ./edgelabs-groot-*.tgz 

WORKDIR /app/package

RUN yarn global add pnpm

RUN pnpm install

CMD ["pnpm", "start"]
