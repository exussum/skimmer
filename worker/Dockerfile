FROM python:3.11.6-alpine3.18
WORKDIR /app
COPY requirements.txt .
RUN apk --update add gcc postgresql-libs postgresql-dev musl-dev
RUN pip install -r requirements.txt
RUN apk del gcc postgresql-dev musl-dev
CMD python skimmer/healthcheck.py && dramatiq -p 2 -f skimmer.worker:scheduler skimmer.worker
