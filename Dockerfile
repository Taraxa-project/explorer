FROM node:14-slim

WORKDIR /app
COPY package* ./

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install
COPY . .

RUN npm run build

CMD ["npm", "start"]