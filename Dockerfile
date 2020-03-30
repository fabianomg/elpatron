FROM node:alpine

# Create app directory
WORKDIR /usr/src/elpatron

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
ENV PORT=3000

EXPOSE $PORT
CMD [ "npm", "start"]