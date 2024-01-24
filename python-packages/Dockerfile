FROM python:3.10.13-alpine3.19
WORKDIR /app
RUN \
    apk --update add gcc make cmake gfortran binutils gfortran patchelf ninja-build automake autoconf openblas-dev g++ linux-headers libffi-dev && \
    env pip install spin==0.4 Cython==0.29.35 meson-python && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /app --no-binary :all: --no-build-isolation --no-deps numpy==1.25.2 && \
    pip install /app/*.whl && \
    env pip install pythran ninja pybind11 && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /app --no-binary :all: --no-build-isolation --no-deps scipy==1.11.4 cffi==1.16.0 && \
    pip install /app/*.whl && \
    env LDFLAGS="-g0 -Wl,--strip-all" pip wheel -w /app --no-binary :all: --no-build-isolation --no-deps scikit-learn==1.3.2
COPY requirements.txt .
RUN pip install twine && pip wheel -w /app --no-build-isolation  -r requirements.txt
CMD /bin/sh
