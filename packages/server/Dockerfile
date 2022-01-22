FROM node:16

WORKDIR /usr/app

COPY ./package*.json ./
COPY ./tsconfig.json ./

RUN npm install

COPY ./src ./

RUN npm run build