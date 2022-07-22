FROM node:16
EXPOSE 3000
WORKDIR /app_dash
COPY . .
RUN npm install
RUN npm install mime
ENTRYPOINT npm start