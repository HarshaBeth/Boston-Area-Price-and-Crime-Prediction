FROM node:20-alpine

WORKDIR /app


# Install dependencies separately for better build caching
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]