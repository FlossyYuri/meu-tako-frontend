# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Instala todas as dependências (incluindo dev para o build)
RUN npm install

# Copia o código fonte
COPY . .

# Build da aplicação Nuxt
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copia apenas o necessário para produção
COPY package*.json ./
RUN npm install --production

# Copia o build do stage anterior
COPY --from=builder /app/.output ./.output

# Expõe a porta
EXPOSE 3000

# Inicia a aplicação
CMD ["node", ".output/server/index.mjs"]