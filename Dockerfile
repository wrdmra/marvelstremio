FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY main.js ./
COPY Data ./Data
COPY public ./public

ENV NODE_ENV=production
ENV PORT=7000
EXPOSE 7000

CMD ["npm", "start"]
