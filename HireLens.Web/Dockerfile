FROM node:20 AS build
WORKDIR /app
COPY ./HireLens.Web/package*.json ./
RUN npm ci
COPY ./HireLens.Web .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80