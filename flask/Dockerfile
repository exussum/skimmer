FROM python:3.10.13-alpine3.19 as skimmer-scikit
WORKDIR /app
COPY requirements-binary.txt .
RUN \
    apk --update add gcc make cmake gfortran binutils gfortran patchelf ninja-build automake autoconf openblas-dev g++ linux-headers libffi-dev && \
    env pip install spin==0.4 Cython==0.29.35 meson-python && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /root --no-binary :all: --no-build-isolation --no-deps numpy==1.25.2 && \
    env pip install pythran ninja pybind11 && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /root --no-binary :all: --no-build-isolation --no-deps scipy==1.11.4 cffi==1.16.0 && \
    pip install /root/*.whl && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /root --no-binary :all: --no-build-isolation --no-deps scikit-learn==1.3.2


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
