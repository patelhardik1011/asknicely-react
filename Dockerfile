FROM node:16-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
# add app
COPY --chown=node:node package.json .

COPY . ./

RUN npm install --silent

COPY --chown=node:node . .
USER node

# start app
CMD ["npm", "start"]