FROM node:14

WORKDIR /usr/src/app

COPY package*.json /tmp/

RUN npm install

COPY . .

EXPOSE 80

# Install MySQL client
RUN apt-get update && apt-get install -y default-mysql-client

CMD ["npm", "run", "dev"]
