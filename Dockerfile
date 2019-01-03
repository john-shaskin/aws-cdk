# FROM node:8.11-alpine

# RUN apk update && \
#     apk add python3 make g++ rsync && \
#     apk add --update bash && \
#     apk add git && \
#     rm -rf /var/cache/apk/* && \
#     npm install -g lerna
FROM node:8.11

RUN apt-get update && \
    # Trying to install Python 3.6
    # apt-get install -y software-properties-common curl && \
    # add-apt-repository -y ppa:jonathonf/python-3.6 && \
    # apt-get update && \
    # End of trying to install python 3.6
    apt-get -y install python3 python3-pip make g++ rsync git && \
    # cd /opt && \
    # wget https://www.python.org/ftp/python/3.6.0/Python-3.6.0.tgz && \
    # tar xvf Python-3.6.0.tgz && \
    # cd Python-3.6.0 && \
    # ./configure --enable-optimizations --with-ensurepip=install && \
    # make altinstall && \
    # alias python3='python3.6' && \
    # alias pip3='pip3.6' && \
    # cd ~/ && \
    npm install -g lerna
ENV NPM_CONFIG_PREFIX=/home/root/.npm-global

# USER node
COPY . /home/node/build
WORKDIR /home/node/build

# Bootstrap and add lerna aliases
RUN ./install.sh && \
    alias lr='lerna run --stream --scope $(node -p "require(\"./package.json\").name")' && \
    alias lb='lr build' && \
    alias lt='lr test' && \
    alias lw='lr watch'

CMD ["./build.sh"]