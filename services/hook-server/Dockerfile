FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY turbo.json ./
COPY services/hook-server/package.json ./services/hook-server/
COPY packages/*/package.json ./packages/*/

RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build --workspace=@repoflight/hook-server

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=@repoflight/hook-server"]