FROM node:24-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-fund --no-audit && npm cache clean --force
COPY --chown=node:node backend/dist ./dist
USER node
ENV NODE_ENV=production
EXPOSE 3100
CMD ["node", "dist/main.js"]
