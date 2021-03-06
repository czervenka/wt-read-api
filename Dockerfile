FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]

EXPOSE 3000
