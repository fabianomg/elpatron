FROM node:alpine

# Create app directory
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm i -g @adonisjs/cli
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
#RUN adonis migration:run

EXPOSE 3333
EXPOSE 9229
CMD [ "npm", "start"]