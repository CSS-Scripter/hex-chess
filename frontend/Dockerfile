FROM node:20 AS build
WORKDIR /app
COPY package*.json .
RUN yarn
COPY . .
RUN yarn build


FROM node:20 AS run

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

RUN ulimit -c unlimited
ENTRYPOINT ["node", "build"]

