FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY turbo.json ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/*/package.json ./packages/*/

RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build --workspace=@repoflight/dashboard

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@repoflight/dashboard"]