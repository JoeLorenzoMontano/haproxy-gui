FROM node:18-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache socat bash sudo openssh-client haproxy curl vim procps shadow

COPY package*.json ./

RUN npm install

COPY . .

# Install any newly added dependencies
RUN npm install

# Make sure scripts are executable
RUN chmod +x /app/scripts/*.sh || true

EXPOSE 3000

CMD ["node", "server.js"]
