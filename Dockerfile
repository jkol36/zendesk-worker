FROM node:onbuild

RUN mkdir -p /home/nodejs/app
WORKDIR /home/nodejs/app

COPY . /home/nodejs/app
RUN npm install
ENV NODE_ENV  production
EXPOSE 3000

CMD ["node", "index.js"]

