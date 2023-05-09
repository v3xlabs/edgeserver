FROM node:20-buster

WORKDIR /app

COPY . .

RUN npm install