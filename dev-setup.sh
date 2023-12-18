#!/bin/bash

brew install ariga/tap/atlas

if [ ! -f worker/.env ]; then
    cat << EOF > worker.env
FLASK_API_ENDPOINT_UPDATE_CHANNEL=http://localhost:8000/api/update_channel
FLASK_SECRET_KEY=
RABBITMQ_URI="amqp://guest:guest@rmq:5672"
WORKER_DB_URI=postgresql://skimmer:skimmer@db/skimmer
EOF
fi

if [ ! -f flask/.env ]; then
    cat << EOF > flask/.env
CHANNEL_GOOGLE_REDIRECT_URL=http://localhost:8000/channel/add_google

FLASK_PERMANENT_SESSION_LIFETIME=3600
FLASK_SQLALCHEMY_DATABASE_URI=postgresql://skimmer:skimmer@db/skimmer
FLASK_SECRET_KEY=

GOOGLE_CLIENT_ID=unset
GOOGLE_CLIENT_SECRET=unset
GOOGLE_REDIRECT_URL="http://localhost:8000/auth/code"

MEMCACHED_KEY_PREFIX=skimmer
MEMCACHED_SERVER=memcached:11211

REACT_HOME_URL=http://localhost:8080/
EOF
fi

docker compose down -v
docker compose build --no-cache
docker compose up -d

sleep 5
make migrate
