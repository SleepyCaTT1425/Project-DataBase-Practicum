FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
RUN npm install promptpay-qr qrcode.react

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
