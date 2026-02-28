FROM mcr.microsoft.com/playwright:v1.42.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

RUN npx playwright install --with-deps

COPY . .


CMD ["npx", "playwright", "test"]