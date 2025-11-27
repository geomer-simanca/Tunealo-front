# Etapa 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir archivos estáticos
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Puesto que Nginx usa el puerto 80 por defecto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
