FROM python:3.11.6-alpine3.18
WORKDIR /app
COPY requirements-binary.txt .
RUN apk --update add --no-cache gcc musl-dev openblas-dev linux-headers g++ && pip install -r requirements-binary.txt && apk del gcc linux-headers g++ openblas-dev && apk add openblas && rm -rf /root/.pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && rm -rf /root/.pip /root/.cache
CMD flask -A skimmer.app run --host=0.0.0.0 --debug
