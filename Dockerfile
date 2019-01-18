FROM python:3.7.2

ENV NODE_VERSION=8.x

RUN apt-get update && \
    apt-get -y install make g++ rsync git zip vim && \
    curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - && \
    apt-get -y install nodejs && \
    npm install -g lerna@3.3

# USER node
RUN mkdir -p /app
WORKDIR /app

# Add lerna aliases
RUN echo "alias lr='lerna run --stream --scope \$(node -p \"require(\\\"./package.json\\\").name\")'" >> ~/.bashrc && \
    echo "alias lb='lr build'" >> ~/.bashrc && \
    echo "alias lt='lr test'" >> ~/.bashrc && \
    echo "alias lw='lr watch'" >> ~/.bashrc

CMD ["bash"]