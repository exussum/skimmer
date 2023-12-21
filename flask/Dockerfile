FROM python:3.11.6-alpine3.18
WORKDIR /app
RUN apk --update add gcc musl-dev openblas-dev linux-headers g++
COPY requirements-binary.txt .
RUN pip install -r requirements-binary.txt
RUN apk del gcc linux-headers g++
COPY requirements.txt .
RUN pip install -r requirements.txt
CMD flask -A skimmer.app run --host=0.0.0.0 --debug
