# --- BUILD STAGE ---
FROM node:lts-slim AS build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY src ./src
COPY tsconfig.json .
RUN yarn build

# --- GET PRODUCTION DEPENDENCIES
FROM node:lts-slim AS deps
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --prod

# --- DEPLOYMENT ---
FROM node:lts-slim
RUN groupadd -g 999 appuser && \
    useradd -r -u 999 -g appuser appuser
USER appuser
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=deps /app/node_modules ./node_modules

RUN mkdir ./games

CMD ["node", "build/main.js"]