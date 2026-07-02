# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
# Keeps devDependencies (prisma CLI, tsx) so `prisma migrate deploy` and the seed script
# can run from this same image at container startup — a deliberate size-for-simplicity
# trade-off appropriate for this project's scale.
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci

COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
