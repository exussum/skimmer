FROM python:3.11.6-alpine3.18
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
CMD flask -A skimmer.app run --host=0.0.0.0 --debug
