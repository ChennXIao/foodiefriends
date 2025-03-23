FROM node:14

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install nodemon --save-dev
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]

