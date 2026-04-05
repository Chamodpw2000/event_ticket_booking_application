# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./
# # RUN npm install --production
# # NEW
# RUN npm install --omit=dev

# COPY prisma ./prisma/
# RUN npx prisma generate

# COPY . .
# COPY entrypoint.sh ./
# RUN chmod +x entrypoint.sh

# EXPOSE 3003

# CMD ["node", "index.js"]


FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3003

CMD ["./entrypoint.sh"]