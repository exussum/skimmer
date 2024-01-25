FROM python:3.10.13-alpine3.19
WORKDIR /app
COPY requirements.txt .
RUN \
    apk --update add musl libpq libstdc++ && \
    pip install --index-url http://registry.exussum.org:8080/simple/ --trusted-host registry.exussum.org -r requirements.txt && \
    rm -rf /root/.cache && \
    find /usr/local -name "*.pyc" | xargs rm
CMD python skimmer/healthcheck.py && dramatiq -p 2 -f skimmer.worker:scheduler skimmer.worker
