FROM node:14

WORKDIR /usr/src/app

COPY ./package*.json ./
RUN npm install
RUN npm install --save-dev nodemon

COPY . .

EXPOSE 8000

CMD ["npm", "start"]

