FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules

COPY . .
COPY entrypoint.sh ./
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 3004

CMD ["sh", "./entrypoint.sh"]