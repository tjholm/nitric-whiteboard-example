# syntax=docker/dockerfile:1
FROM node:alpine as build

ARG HANDLER

# Python and make are required by certain native package build processes in NPM packages.
RUN apk add g++ make py3-pip git

RUN yarn global add typescript @vercel/ncc

WORKDIR /usr/app

COPY package.json *.lock *-lock.json /

RUN yarn import || echo ""

RUN set -ex && \
    yarn install --production --frozen-lockfile --cache-folder /tmp/.cache && \
    rm -rf /tmp/.cache

RUN test -f tsconfig.json || echo "{\"compilerOptions\":{\"esModuleInterop\":true,\"target\":\"es2015\",\"moduleResolution\":\"node\"}}" > tsconfig.json

COPY . .

# Build the react app
RUN yarn build

RUN \
  --mount=type=cache,sharing=private,target=/tmp/ncc-cache \
  ncc build ${HANDLER} -o lib/ -t

FROM node:alpine as final

WORKDIR /usr/app

RUN apk update && \
    apk add --no-cache ca-certificates git && \
    update-ca-certificates

COPY package.json *.lock *-lock.json ./

RUN set -ex && \
    yarn install --production --frozen-lockfile --cache-folder /tmp/.cache && \
    rm -rf /tmp/.cache

COPY . .

COPY --from=build /usr/app/lib/ ./lib/
COPY --from=build /usr/app/public/ ./public/

ENTRYPOINT ["node", "lib/index.js"]