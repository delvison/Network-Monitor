FROM node:boron
MAINTAINER Delvison Castillo (delvisoncastillo@gmail.com)

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app 

EXPOSE 3000
CMD [ "npm","start"]

# docker build -t redis ./redis
# docker run -d --name redis -p 6379:6379 redis
# docker build -t node_app ./node_app
# docker run -it --name node_app_deployed -p 3000 --link redis:redis node_app
