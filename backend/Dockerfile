FROM node:18-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache socat bash sudo openssh-client haproxy

COPY package*.json ./

RUN npm install

COPY . .

# Make sure scripts are executable
RUN chmod +x /app/scripts/*.sh

EXPOSE 3000

CMD ["node", "server.js"]
