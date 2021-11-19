FROM node:16-slim

RUN apt-get update || : && apt-get install -y \
    python3 \
    build-essential

WORKDIR /app
COPY package* ./

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm ci
COPY . .

RUN npm run build

CMD ["npm", "start"]