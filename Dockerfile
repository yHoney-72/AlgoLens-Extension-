FROM node:24.20.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

CMD ["npm", "run", "check"]
