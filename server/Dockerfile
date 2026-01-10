FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/tsconfig.json ./
RUN npm install --quiet
COPY server/src ./src
EXPOSE 3001
CMD ["npm", "run", "dev"]
