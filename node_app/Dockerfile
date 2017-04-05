FROM ubuntu:14.04
MAINTAINER Delvison Castillo (delvisoncastillo@gmail.com)
RUN apt-get -y update
RUN apt-get -y install nodejs-legacy
RUN apt-get -y install npm
WORKDIR /src
EXPOSE 3000
CMD [ "npm","start"]

# docker build -t redis ./redis
# docker run -d --name redis -p 6379:6379 redis
# docker build -t node_app ./node_app
# docker run -it --name node_app_deployed -p 3000 --link redis:redis node_app
