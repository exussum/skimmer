FROM node:20.9.0-alpine3.18
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install
CMD env HOST=0.0.0.0 yarn start
