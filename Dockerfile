FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY tslint.json ./

COPY src ./src

RUN npm install
RUN npm run build

COPY . .

EXPOSE 3001

CMD [ "node", "./dist/main.js" ]
