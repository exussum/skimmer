FROM python:3.11.6-alpine3.18 as skimmer-worker-packages
WORKDIR /app
COPY requirements.txt .
RUN \
    apk --update add libev make file python3-dev cmake libffi-dev gcc g++ postgresql-libs postgresql-dev musl-dev && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel --no-binary :all: -w /root -r requirements.txt

FROM python:3.11.6-alpine3.18
WORKDIR /app
RUN \
    --mount=type=bind,from=skimmer-worker-packages,source=/root,target=/tmp/wheel pip install /tmp/wheel/*.whl && \
    apk --update add libpq libstdc++ && \
    rm -rf /root/.cache && \
    find /usr/local -name "*.pyc" | xargs rm
CMD python skimmer/healthcheck.py && dramatiq -p 2 -f skimmer.worker:scheduler skimmer.worker
