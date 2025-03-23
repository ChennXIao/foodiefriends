# FROM node:14

# WORKDIR /usr/src/app

# COPY package.json package-lock.json ./

# COPY . .

# CMD ["npm", "run", "dev"]

# Base image
# FROM node:alpine
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app
# # COPY package.json /usr/src/app/
# COPY ["package*.json","/usr/src/app/"]

# RUN npm install

# COPY . /usr/src/app
# CMD ["npm", "run", "dev"]

# 使用 Node.js Alpine 版本作為基底映像
# FROM node:alpine

# # 設置工作目錄
# WORKDIR /usr/src/app

# # 複製 package.json 和 package-lock.json
# COPY ["package*.json","./"]

# # 安裝依賴
# RUN npm install

# # 複製所有應用程式代碼
# COPY . .

# # 預設指令
# CMD ["npm", "run", "dev"]


FROM node:14

WORKDIR /usr/src/app

COPY ./package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]

