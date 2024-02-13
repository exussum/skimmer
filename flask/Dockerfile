FROM python:3.10.13-alpine3.19
WORKDIR /app
COPY requirements.txt .
RUN \
    apk --update add musl openblas libgomp libpq libstdc++ libmemcached zlib && \
    pip install --index-url http://registry.exussum.org:8080/simple/ --trusted-host registry.exussum.org -r requirements.txt && \
    rm -rf /root/.cache && \
    find /usr/local -name "*.pyc" | xargs rm

CMD env DEBUG=true gunicorn -w 4 -b 0.0.0.0 'skimmer.app:app' --reload
