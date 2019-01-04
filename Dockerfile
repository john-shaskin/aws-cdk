FROM python:3.6.5
RUN apt-get update && \
    apt-get -y install make g++ rsync git zip && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get -y install nodejs && \
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