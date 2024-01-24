FROM python:3.10.13-alpine3.19
WORKDIR /app
COPY requirements.txt .
RUN \
    --mount=type=bind,from=skimmer-scikit,source=/root,target=/tmp/wheel pip install /tmp/wheel/*.whl && \
    apk --update add openblas libgomp libpq libstdc++ && \
    pip install -r requirements.txt && \
    rm -rf /root/.cache && \
    find /usr/local -name "*.pyc" | xargs rm

CMD flask -A skimmer.app run --host=0.0.0.0 --debug
