FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Expose the application Ports
EXPOSE 3000 3001

USER node

# Start the application
ENTRYPOINT ["node", "dist/main"]
