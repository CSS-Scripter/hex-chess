FROM node:lts-alpine

RUN npm install -g http-server
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .

RUN yarn build

EXPOSE 8080
CMD [ "http-server", "dist", "--proxy", "http://localhost:8080?" ]