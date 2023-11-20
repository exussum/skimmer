#!/bin/bash

brew install ariga/tap/atlas

if [ ! -f flask/.env ]; then
    cat << EOF > flask/.env
GOOGLE_CLIENT_ID=unset
GOOGLE_CLIENT_SECRET=unset
GOOGLE_REDIRECT_URL="http://localhost:8000/auth/code"
MEMCACHED_KEY_PREFIX=skimmer
MEMCACHED_SERVER=memcached:11211
REACT_HOME_URL=http://localhost:8080/
FLASK_PERMANENT_SESSION_LIFETIME=5
FLASK_SQLALCHEMY_DATABASE_URI=postgresql://skimmer:skimmer@db/skimmer
EOF
fi

docker compose down -v
docker compose build --no-cache
docker compose up -d

# used on intel machines, I don't have an m1 anymore.
sleep 5
make migrate translate
