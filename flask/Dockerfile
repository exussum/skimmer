FROM python:3.11.6-alpine3.18
ADD . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD flask -A app run --host=0.0.0.0 --debug
