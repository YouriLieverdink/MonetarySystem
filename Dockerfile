FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY .eslintrc ./

COPY src ./src

RUN npm install
RUN npm run build

COPY . .

EXPOSE 3001

CMD [ "node", "./dist/index.js" ]
