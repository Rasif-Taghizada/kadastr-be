# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# only production deps
RUN npm install --omit=dev

# copy node_modules from builder (faster startup)
COPY --from=builder /app/node_modules ./node_modules

# compiled app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json


COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["sh", "entrypoint.sh"]
