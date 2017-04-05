FROM ubuntu:14.04
MAINTAINER Delvison Castillo (delvisoncastillo@gmail.com)
RUN apt-get update
RUN apt-get install -y python python-pip tcpdump
RUN pip install --upgrade pip
RUN pip install scapy
RUN pip install pyttsx
ENV TERM xterm
#COPY ./ /src
CMD ["/src/check_connections.py","-f", "/src/resources/mac_addresses.json","-e","/src/resources/blacklist.txt"]
