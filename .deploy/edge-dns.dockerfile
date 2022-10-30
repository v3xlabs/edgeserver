FROM node:16.9.1

WORKDIR /app

RUN yarn global add pnpm

COPY ./apps/dns-validate/edgelabs-dns-validate*.tgz ./

RUN tar zxvf ./edgelabs-dns-validate-*.tgz 

WORKDIR /app/package

RUN pnpm install

CMD ["pnpm", "start"]