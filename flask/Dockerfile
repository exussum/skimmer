FROM python:3.10.13-alpine3.19 as skimmer-scikit
WORKDIR /app
COPY requirements-binary.txt .
RUN \
    apk --update add gcc make cmake gfortran binutils gfortran patchelf ninja-build automake autoconf openblas-dev g++ && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /root -r requirements-binary.txt

FROM python:3.10.13-alpine3.19
WORKDIR /app
COPY requirements.txt .
RUN \
    --mount=type=bind,from=skimmer-scikit,source=/root,target=/tmp/wheel pip install /tmp/wheel/*.whl && \
    apk --update add libgomp libpq libstdc++ && \
    pip install --compile -r requirements.txt && \
    rm -rf /root/.cache && \
    find /usr/local -name "*.pyc" | xargs rm

CMD flask -A skimmer.app run --host=0.0.0.0 --debug
